import { ApiKeyStore, UserStore } from '../data/store.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ecoloop_secret_campus_key_2026';

/**
 * Middleware that validates API Key authentication for Public REST API.
 * Accepts API key via:
 * 1. Header: X-API-Key: <key>
 * 2. Header: Authorization: ApiKey <key>
 * 3. Query: ?apiKey=<key>
 * 
 * Also optionally supports JWT Bearer token if an authenticated campus user calls it.
 */
export const requireApiKey = async (req, res, next) => {
  let apiKey = req.headers['x-api-key'];

  if (!apiKey && req.headers.authorization) {
    if (req.headers.authorization.startsWith('ApiKey ')) {
      apiKey = req.headers.authorization.split(' ')[1];
    } else if (req.headers.authorization.startsWith('Bearer ')) {
      // Allow JWT bearer token as fallback for internal portal calls
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await UserStore.findById(decoded.id);
        if (user) {
          req.user = user;
          req.apiCaller = {
            type: 'jwt_user',
            name: user.name,
            email: user.email,
            role: user.role,
          };
          return next();
        }
      } catch (err) {
        // Fall through to API key check
      }
    }
  }

  if (!apiKey && req.query.apiKey) {
    apiKey = req.query.apiKey;
  }

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: API Key Required',
      message:
        'Access to EcoLoop Public REST API requires a valid API key. Pass via X-API-Key header or ?apiKey query parameter.',
      documentation: '/api/docs',
      demoApiKey: 'ecoloop_live_public_key_2026_demo',
    });
  }

  try {
    const keyRecord = await ApiKeyStore.findByKey(apiKey.trim());
    if (!keyRecord || !keyRecord.active) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Invalid API Key',
        message: 'The provided API key is invalid, inactive, or revoked.',
        documentation: '/api/docs',
      });
    }

    // Increment usage metrics
    ApiKeyStore.incrementUsage(apiKey.trim()).catch((err) =>
      console.warn('Could not record API key usage:', err.message)
    );

    req.apiKey = keyRecord;
    req.apiCaller = {
      type: 'api_key',
      name: keyRecord.name,
      email: keyRecord.ownerEmail,
      role: keyRecord.role || 'external_campus',
    };

    if (!req.user) {
      req.user = {
        _id: 'api_' + (keyRecord._id || 'ext'),
        id: 'api_' + (keyRecord._id || 'ext'),
        name: keyRecord.name,
        email: keyRecord.ownerEmail,
        role: keyRecord.role || 'external_campus',
        hostel: 'Inter-Campus Hub',
      };
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error verifying API key',
      error: error.message,
    });
  }
};

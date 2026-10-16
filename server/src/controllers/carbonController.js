import {
  getCampusCarbonData,
  getStudentCarbonCertificate,
  generateStudentCarbonCertificatePdf,
} from '../services/carbonService.js';
import { UserStore } from '../data/store.js';

export const getCampusCarbon = async (req, res) => {
  try {
    const data = await getCampusCarbonData();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching campus carbon data:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving carbon data',
      error: error.message,
    });
  }
};

export const getStudentCertificate = async (req, res) => {
  try {
    // If student id passed in query/param and user is admin, allow viewing
    let targetUser = req.user;
    if (req.query.studentId && (req.user?.role === 'admin' || req.user?.role === 'collector')) {
      const found = await UserStore.findByStudentId(req.query.studentId);
      if (found) targetUser = found;
    }

    if (!targetUser) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const data = await getStudentCarbonCertificate(targetUser);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error generating student carbon certificate data:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error generating certificate data',
      error: error.message,
    });
  }
};

export const downloadStudentCertificatePdf = async (req, res) => {
  try {
    let targetUser = req.user;
    if (req.query.studentId && (req.user?.role === 'admin' || req.user?.role === 'collector')) {
      const found = await UserStore.findByStudentId(req.query.studentId);
      if (found) targetUser = found;
    }

    if (!targetUser) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const pdfBuffer = await generateStudentCarbonCertificatePdf(targetUser);
    const sanitizedName = (targetUser.name || 'Student').replace(/[^a-zA-Z0-9]/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="EcoLoop_Carbon_Certificate_${sanitizedName}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating student carbon certificate PDF:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error generating certificate PDF',
      error: error.message,
    });
  }
};

/**
 * GET /api/carbon/story
 * Generates personal impact story for each student strictly from actual database records.
 */
export const getStudentStory = async (req, res) => {
  try {
    let targetUser = req.user;
    const lookupId = req.params?.studentId || req.query?.studentId || req.query?.email;
    if (lookupId) {
      const allStudents = await UserStore.getAllStudents();
      const found = allStudents.find(
        (s) =>
          s.studentId?.toLowerCase() === lookupId.toLowerCase() ||
          s.email?.toLowerCase() === lookupId.toLowerCase() ||
          s._id?.toString() === lookupId
      ) || (await UserStore.findByEmail(lookupId));
      if (found) targetUser = found;
    }

    if (!targetUser) {
      targetUser = await UserStore.findByEmail('baibhav@ecoloop.campus');
    }

    const { impactStoryService } = await import('../services/impactStoryService.js');
    const data = await impactStoryService.getStudentImpactStory(targetUser);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error generating personal impact story:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error generating personal impact story: ' + error.message,
    });
  }
};


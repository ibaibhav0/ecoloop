import {
  UserModel,
  EWasteItemModel,
  HandoverModel,
  NotificationModel,
  PartnerModel,
  BulkPickupModel,
  ApiKeyModel,
} from '../models/schema.js';
import { isFallback } from '../config/db.js';
import crypto from 'crypto';

// In-memory fallback collections
const memoryStore = {
  users: [],
  items: [],
  handovers: [],
  notifications: [],
  partners: [],
  bulkPickups: [],
  apiKeys: [],
};

export const UserStore = {
  async findByEmail(email) {
    if (!isFallback()) {
      try {
        return await UserModel.findOne({ email: email.toLowerCase() });
      } catch (e) {
        console.warn('Fallback to memory for findByEmail:', e.message);
      }
    }
    return memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findById(id) {
    if (!isFallback()) {
      try {
        return await UserModel.findById(id).select('-password');
      } catch (e) {
        console.warn('Fallback to memory for findById:', e.message);
      }
    }
    const user = memoryStore.users.find(u => u._id.toString() === id.toString());
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  },

  async create(userData) {
    if (!isFallback()) {
      try {
        const user = new UserModel(userData);
        return await user.save();
      } catch (e) {
        console.warn('Fallback to memory for create user:', e.message);
      }
    }
    const newUser = {
      _id: 'user_' + crypto.randomUUID().slice(0, 8),
      ...userData,
      points: userData.points || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.users.push(newUser);
    return newUser;
  },

  async addPoints(userId, points) {
    if (!isFallback()) {
      try {
        return await UserModel.findByIdAndUpdate(
          userId,
          { $inc: { points: Number(points) } },
          { new: true }
        );
      } catch (e) {
        console.warn('Fallback to memory for addPoints:', e.message);
      }
    }
    const user = memoryStore.users.find(u => u._id.toString() === userId.toString());
    if (user) {
      user.points = (user.points || 0) + Number(points);
      user.updatedAt = new Date();
      return user;
    }
    return null;
  },

  async getAllStudents() {
    if (!isFallback()) {
      try {
        return await UserModel.find({ role: 'student' }).select('-password').sort({ points: -1 });
      } catch (e) {
        console.warn('Fallback to memory for getAllStudents:', e.message);
      }
    }
    return memoryStore.users
      .filter(u => u.role === 'student')
      .map(({ password, ...rest }) => rest)
      .sort((a, b) => (b.points || 0) - (a.points || 0));
  },
};

export const ItemStore = {
  async create(itemData) {
    if (!isFallback()) {
      try {
        const item = new EWasteItemModel(itemData);
        return await item.save();
      } catch (e) {
        console.warn('Fallback to memory for create item:', e.message);
      }
    }
    const newItem = {
      _id: 'item_' + crypto.randomUUID().slice(0, 8),
      ...itemData,
      status: itemData.status || 'registered',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.items.unshift(newItem);
    return newItem;
  },

  async findById(id) {
    if (!isFallback()) {
      try {
        return await EWasteItemModel.findById(id);
      } catch (e) {
        console.warn('Fallback to memory for findById item:', e.message);
      }
    }
    return (
      memoryStore.items.find(
        i => i._id.toString() === id.toString() || i.trackingCode === id
      ) || null
    );
  },

  async findByTrackingCode(code) {
    if (!isFallback()) {
      try {
        return await EWasteItemModel.findOne({ trackingCode: code });
      } catch (e) {
        console.warn('Fallback to memory for findByTrackingCode:', e.message);
      }
    }
    return memoryStore.items.find(i => i.trackingCode === code) || null;
  },

  async findAll(filter = {}) {
    if (!isFallback()) {
      try {
        const query = {};
        if (filter.userId) query.userId = filter.userId;
        if (filter.status && filter.status !== 'all') query.status = filter.status;
        if (filter.userHostel && filter.userHostel !== 'all') query.userHostel = filter.userHostel;
        if (filter.type && filter.type !== 'all') query.type = filter.type;

        return await EWasteItemModel.find(query).sort({ createdAt: -1 });
      } catch (e) {
        console.warn('Fallback to memory for findAll:', e.message);
      }
    }

    return memoryStore.items
      .filter(i => {
        if (filter.userId && i.userId?.toString() !== filter.userId.toString()) return false;
        if (filter.status && filter.status !== 'all' && i.status !== filter.status) return false;
        if (filter.userHostel && filter.userHostel !== 'all' && i.userHostel !== filter.userHostel) return false;
        if (filter.type && filter.type !== 'all' && i.type !== filter.type) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async updateById(id, updateFields) {
    if (!isFallback()) {
      try {
        return await EWasteItemModel.findByIdAndUpdate(
          id,
          { ...updateFields, updatedAt: new Date() },
          { new: true }
        );
      } catch (e) {
        console.warn('Fallback to memory for updateById:', e.message);
      }
    }
    const item = memoryStore.items.find(
      i => i._id.toString() === id.toString() || i.trackingCode === id
    );
    if (item) {
      Object.assign(item, updateFields, { updatedAt: new Date() });
      return item;
    }
    return null;
  },
};

export const HandoverStore = {
  async create(handoverData) {
    if (!isFallback()) {
      try {
        const handover = new HandoverModel(handoverData);
        return await handover.save();
      } catch (e) {
        console.warn('Fallback to memory for create handover:', e.message);
      }
    }
    const newHandover = {
      _id: 'hov_' + crypto.randomUUID().slice(0, 8),
      ...handoverData,
      timestamp: new Date(),
    };
    memoryStore.handovers.push(newHandover);
    return newHandover;
  },

  async findByItemId(itemId) {
    if (!isFallback()) {
      try {
        return await HandoverModel.find({ itemId }).sort({ timestamp: 1 });
      } catch (e) {
        console.warn('Fallback to memory for findByItemId:', e.message);
      }
    }
    return memoryStore.handovers
      .filter(h => h.itemId?.toString() === itemId.toString())
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  },

  async findAll() {
    if (!isFallback()) {
      try {
        return await HandoverModel.find().sort({ timestamp: -1 });
      } catch (e) {
        console.warn('Fallback to memory for findAll handovers:', e.message);
      }
    }
    return [...memoryStore.handovers].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },
};

export const NotificationStore = {
  async create(notifData) {
    if (!isFallback()) {
      try {
        const notif = new NotificationModel(notifData);
        return await notif.save();
      } catch (e) {
        console.warn('Fallback to memory for create notification:', e.message);
      }
    }
    const newNotif = {
      _id: 'notif_' + crypto.randomUUID().slice(0, 8),
      ...notifData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.notifications.unshift(newNotif);
    return newNotif;
  },

  async findAll(filter = {}) {
    if (!isFallback()) {
      try {
        const query = {};
        if (filter.recipientEmail) query.recipientEmail = filter.recipientEmail.toLowerCase();
        if (filter.recipientRole) query.recipientRole = filter.recipientRole;
        return await NotificationModel.find(query).sort({ createdAt: -1 }).limit(50);
      } catch (e) {
        console.warn('Fallback to memory for findAll notifications:', e.message);
      }
    }
    return memoryStore.notifications
      .filter(n => {
        if (filter.recipientEmail && n.recipientEmail?.toLowerCase() !== filter.recipientEmail.toLowerCase()) return false;
        if (filter.recipientRole && n.recipientRole !== filter.recipientRole) return false;
        return true;
      })
      .slice(0, 50);
  },

  async markAsRead(id) {
    if (!isFallback()) {
      try {
        return await NotificationModel.findByIdAndUpdate(id, { read: true }, { new: true });
      } catch (e) {
        console.warn('Fallback to memory for markAsRead:', e.message);
      }
    }
    const notif = memoryStore.notifications.find(n => n._id.toString() === id.toString());
    if (notif) {
      notif.read = true;
      notif.updatedAt = new Date();
      return notif;
    }
    return null;
  },
};

export const PartnerStore = {
  async create(data) {
    if (!isFallback()) {
      try {
        const partner = new PartnerModel(data);
        return await partner.save();
      } catch (e) {
        console.warn('Fallback to memory for create partner:', e.message);
      }
    }
    const newPartner = {
      _id: 'partner_' + crypto.randomUUID().slice(0, 8),
      ...data,
      verified: data.verified !== undefined ? data.verified : true,
      activeDrivesCount: data.activeDrivesCount || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.partners.push(newPartner);
    return newPartner;
  },

  async findAll(filter = {}) {
    if (!isFallback()) {
      try {
        const query = {};
        if (filter.city) query.city = new RegExp(filter.city, 'i');
        if (filter.orgType) query.orgType = filter.orgType;
        return await PartnerModel.find(query).sort({ orgName: 1 });
      } catch (e) {
        console.warn('Fallback to memory for findAll partners:', e.message);
      }
    }
    return memoryStore.partners.filter(p => {
      if (filter.city && !p.city?.toLowerCase().includes(filter.city.toLowerCase())) return false;
      if (filter.orgType && p.orgType !== filter.orgType) return false;
      return true;
    });
  },

  async findById(id) {
    if (!isFallback()) {
      try {
        return await PartnerModel.findById(id);
      } catch (e) {
        console.warn('Fallback to memory for findById partner:', e.message);
      }
    }
    return memoryStore.partners.find(p => p._id.toString() === id.toString()) || null;
  },

  async findByEmail(email) {
    if (!isFallback()) {
      try {
        return await PartnerModel.findOne({ contactEmail: email.toLowerCase() });
      } catch (e) {
        console.warn('Fallback to memory for findByEmail partner:', e.message);
      }
    }
    return memoryStore.partners.find(p => p.contactEmail?.toLowerCase() === email.toLowerCase()) || null;
  },
};

export const BulkPickupStore = {
  async create(data) {
    const referenceCode =
      data.referenceCode ||
      `BULK-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    if (!isFallback()) {
      try {
        const pickup = new BulkPickupModel({ ...data, referenceCode });
        return await pickup.save();
      } catch (e) {
        console.warn('Fallback to memory for create bulk pickup:', e.message);
      }
    }
    const newPickup = {
      _id: 'bulk_' + crypto.randomUUID().slice(0, 8),
      referenceCode,
      ...data,
      status: data.status || 'requested',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.bulkPickups.unshift(newPickup);
    return newPickup;
  },

  async findAll(filter = {}) {
    if (!isFallback()) {
      try {
        const query = {};
        if (filter.city) query.city = new RegExp(filter.city, 'i');
        if (filter.status) query.status = filter.status;
        if (filter.partnerId) query.partnerId = filter.partnerId;
        return await BulkPickupModel.find(query).sort({ createdAt: -1 });
      } catch (e) {
        console.warn('Fallback to memory for findAll bulk pickups:', e.message);
      }
    }
    return memoryStore.bulkPickups.filter(b => {
      if (filter.city && !b.city?.toLowerCase().includes(filter.city.toLowerCase())) return false;
      if (filter.status && b.status !== filter.status) return false;
      if (filter.partnerId && b.partnerId !== filter.partnerId) return false;
      return true;
    });
  },

  async findById(id) {
    if (!isFallback()) {
      try {
        return await BulkPickupModel.findById(id);
      } catch (e) {
        console.warn('Fallback to memory for findById bulk pickup:', e.message);
      }
    }
    return memoryStore.bulkPickups.find(b => b._id.toString() === id.toString() || b.referenceCode === id) || null;
  },

  async updateStatus(id, status, notes = '') {
    if (!isFallback()) {
      try {
        const updateData = { status, updatedAt: new Date() };
        if (notes) updateData.notes = notes;
        return await BulkPickupModel.findByIdAndUpdate(id, updateData, { new: true });
      } catch (e) {
        console.warn('Fallback to memory for updateStatus bulk pickup:', e.message);
      }
    }
    const pickup = memoryStore.bulkPickups.find(b => b._id.toString() === id.toString() || b.referenceCode === id);
    if (pickup) {
      pickup.status = status;
      if (notes) pickup.notes = notes;
      pickup.updatedAt = new Date();
      return pickup;
    }
    return null;
  },
};

export const ApiKeyStore = {
  async create(data) {
    const key = data.key || `ecoloop_live_${crypto.randomBytes(16).toString('hex')}`;
    if (!isFallback()) {
      try {
        const apiKey = new ApiKeyModel({ ...data, key });
        return await apiKey.save();
      } catch (e) {
        console.warn('Fallback to memory for create API key:', e.message);
      }
    }
    const newApiKey = {
      _id: 'key_' + crypto.randomUUID().slice(0, 8),
      key,
      ...data,
      active: data.active !== undefined ? data.active : true,
      requestCount: 0,
      lastUsedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.apiKeys.push(newApiKey);
    return newApiKey;
  },

  async findByKey(key) {
    if (!key) return null;
    if (!isFallback()) {
      try {
        return await ApiKeyModel.findOne({ key, active: true });
      } catch (e) {
        console.warn('Fallback to memory for findByKey:', e.message);
      }
    }
    return memoryStore.apiKeys.find(k => k.key === key && k.active) || null;
  },

  async incrementUsage(key) {
    if (!key) return;
    if (!isFallback()) {
      try {
        return await ApiKeyModel.findOneAndUpdate(
          { key },
          { $inc: { requestCount: 1 }, $set: { lastUsedAt: new Date() } },
          { new: true }
        );
      } catch (e) {
        console.warn('Fallback to memory for incrementUsage:', e.message);
      }
    }
    const found = memoryStore.apiKeys.find(k => k.key === key);
    if (found) {
      found.requestCount = (found.requestCount || 0) + 1;
      found.lastUsedAt = new Date();
      found.updatedAt = new Date();
    }
  },

  async findAll() {
    if (!isFallback()) {
      try {
        return await ApiKeyModel.find().sort({ createdAt: -1 });
      } catch (e) {
        console.warn('Fallback to memory for findAll apiKeys:', e.message);
      }
    }
    return memoryStore.apiKeys;
  },
};

export const getRawMemory = () => memoryStore;


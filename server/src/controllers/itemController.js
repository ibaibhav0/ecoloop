import QRCode from 'qrcode';
import { ItemStore, HandoverStore, UserStore } from '../data/store.js';
import { notificationService } from '../services/notificationService.js';

const sanitizeItem = (item) => {
  if (!item) return item;
  const obj = item.toObject ? item.toObject() : { ...item };
  if (obj.userHostel === 'Institutional Lab Bay 1' || obj.userHostel === 'Hostel Institutional Lab Bay 1') {
    obj.userHostel = 'Yourspace';
  }
  if (obj.location) {
    obj.location = obj.location
      .replace(/Hostel\s+Institutional\s+Lab\s+Bay\s+1/gi, 'Yourspace')
      .replace(/Institutional\s+Lab\s+Bay\s+1/gi, 'Yourspace')
      .replace(/Hostel\s+Yourspace/gi, 'Yourspace');
  }
  return obj;
};

export const registerItem = async (req, res) => {
  try {
    const {
      type,
      productName,
      customerType,
      approxWeight,
      photoUrl = '',
      notes = '',
      registeredBy,
      email,
      phone,
      hostel,
      location,
    } = req.body;

    if (!type || !approxWeight) {
      return res.status(400).json({ success: false, message: 'Item type and approximate weight are required' });
    }

    const weightNum = parseFloat(approxWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid approximate weight in kg' });
    }

    const determinedCustomerType = customerType || (req.user?.role === 'college' ? 'college' : 'student');
    const userName = registeredBy || req.user.name || 'External Contributor';
    const userEmail = email || req.user.email || 'contributor@campus.edu';
    const userPhone = phone || req.user.phone || '';
    let userHostel = hostel || req.user.hostel || 'Inter-Campus';
    if (
      userHostel === 'Institutional Lab Bay 1' ||
      userHostel === 'Hostel Institutional Lab Bay 1' ||
      (determinedCustomerType === 'college' && (!hostel || hostel === 'Institutional Lab Bay 1'))
    ) {
      userHostel = 'Yourspace';
    }
    let itemLocation = location || (userHostel === 'Yourspace' ? 'Yourspace' : `Hostel ${userHostel}`);
    if (itemLocation.includes('Institutional Lab Bay 1') || itemLocation.includes('Hostel Institutional Lab Bay 1')) {
      itemLocation = itemLocation
        .replace(/Hostel\s+Institutional\s+Lab\s+Bay\s+1/gi, 'Yourspace')
        .replace(/Institutional\s+Lab\s+Bay\s+1/gi, 'Yourspace')
        .replace(/Hostel\s+Yourspace/gi, 'Yourspace');
    }

    // Generate unique tracking code
    const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const trackingCode = `ECO-${new Date().getFullYear()}-${uniqueSuffix}`;

    // Generate secure 4-digit handover OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const userBranch = req.body.branch || req.body.department || req.user.department || 'Computer Science & Engineering (CSE)';

    // Payload embedded in digital tag
    const qrPayload = JSON.stringify({
      trackingCode,
      otp,
      type,
      productName: productName || type,
      customerType: determinedCustomerType,
      approxWeight: weightNum,
      registeredBy: userName,
      hostel: userHostel,
      branch: userBranch,
    });

    // Generate QR Code data URL (kept for optional digital badge)
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      scale: 8,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    const newItem = await ItemStore.create({
      trackingCode,
      otp,
      userBranch,
      userId: req.user._id || req.user.id,
      userName,
      userEmail,
      userPhone,
      userHostel,
      type,
      productName: productName || type,
      customerType: determinedCustomerType,
      approxWeight: weightNum,
      actualWeight: null,
      photoUrl: photoUrl || '',
      qrCode: qrCodeDataUrl,
      status: 'registered',
      pickupDate: '',
      location: itemLocation,
      notes,
    });

    // Create initial registration audit log
    await HandoverStore.create({
      itemId: newItem._id,
      trackingCode: newItem.trackingCode,
      fromRole: 'student',
      toRole: 'student',
      location: `Hostel ${req.user.hostel}`,
      actorName: req.user.name,
      actorId: (req.user._id || req.user.id).toString(),
      verified: true,
      notes: 'Item registered on EcoLoop campus platform',
    });

    return res.status(201).json({
      success: true,
      message: 'E-waste item registered successfully',
      item: newItem,
    });
  } catch (error) {
    console.error('Register item error:', error);
    return res.status(500).json({ success: false, message: 'Server error registering item', error: error.message });
  }
};

export const schedulePickup = async (req, res) => {
  try {
    const { id } = req.params;
    const { pickupDate, location, notes = '' } = req.body;

    if (!pickupDate || !location) {
      return res.status(400).json({ success: false, message: 'Pickup date and location are required' });
    }

    const item = await ItemStore.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Check ownership unless admin/collector
    const isOwner = item.userId.toString() === (req.user._id || req.user.id).toString();
    if (!isOwner && !['admin', 'collector', 'collection'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to schedule this item' });
    }

    const updatedItem = await ItemStore.updateById(item._id, {
      pickupDate,
      location,
      notes: notes || item.notes,
      status: 'scheduled',
    });

    await HandoverStore.create({
      itemId: updatedItem._id,
      trackingCode: updatedItem.trackingCode,
      fromRole: 'student',
      toRole: 'collection_team',
      location,
      actorName: req.user.name,
      actorId: (req.user._id || req.user.id).toString(),
      verified: true,
      notes: `Pickup scheduled for ${pickupDate} at ${location}. ${notes ? `Note: ${notes}` : ''}`,
    });

    // Trigger Real-Time Notifications
    // 1. Notify Student via real Email + SMS
    const studentUser = (await UserStore.findById(item.userId)) || {
      name: item.userName,
      email: item.userEmail,
      phone: item.userPhone || '+919876543210',
    };
    notificationService.notifyPickupScheduled(updatedItem, studentUser).catch(e => console.warn('Pickup notif error:', e));

    // 2. Notify Collection Team for this area via real Email + SMS
    const collector = (await UserStore.findByEmail('collector@ecoloop.campus')) || {
      name: 'Piyush Raj',
      email: 'collector@ecoloop.campus',
      phone: '+919823456789',
    };
    notificationService.notifyCollectionTeamNewRequest(updatedItem, studentUser, collector).catch(e => console.warn('Collector notif error:', e));

    return res.status(200).json({
      success: true,
      message: 'Pickup scheduled successfully',
      item: updatedItem,
    });
  } catch (error) {
    console.error('Schedule pickup error:', error);
    return res.status(500).json({ success: false, message: 'Server error scheduling pickup', error: error.message });
  }
};

export const getItems = async (req, res) => {
  try {
    const {
      status,
      hostel,
      type,
      search,
      minWeight,
      maxWeight,
      limit = 50,
      page = 1,
      sort = 'date_desc',
    } = req.query;
    const filter = {};

    // Students only see their own items unless querying explicitly by tracking
    if (req.user?.role === 'student') {
      filter.userId = req.user._id || req.user.id;
    }

    if (status && status !== 'all') filter.status = status;
    if (hostel && hostel !== 'all') filter.userHostel = hostel;
    if (type && type !== 'all') filter.type = type;

    let items = await ItemStore.findAll(filter);

    // Apply search filter
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        i =>
          i.trackingCode?.toLowerCase().includes(q) ||
          i.type?.toLowerCase().includes(q) ||
          i.userName?.toLowerCase().includes(q) ||
          i.location?.toLowerCase().includes(q)
      );
    }

    // Apply minWeight and maxWeight filters
    if (minWeight !== undefined && !isNaN(parseFloat(minWeight))) {
      const min = parseFloat(minWeight);
      items = items.filter(i => (i.actualWeight || i.approxWeight || 0) >= min);
    }
    if (maxWeight !== undefined && !isNaN(parseFloat(maxWeight))) {
      const max = parseFloat(maxWeight);
      items = items.filter(i => (i.actualWeight || i.approxWeight || 0) <= max);
    }

    // Apply sorting
    if (sort === 'weight_desc') {
      items.sort((a, b) => (b.actualWeight || b.approxWeight || 0) - (a.actualWeight || a.approxWeight || 0));
    } else if (sort === 'weight_asc') {
      items.sort((a, b) => (a.actualWeight || a.approxWeight || 0) - (b.actualWeight || b.approxWeight || 0));
    } else if (sort === 'date_asc') {
      items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      // default: date_desc
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const total = items.length;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const paginatedItems = items.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    const sanitizedItems = paginatedItems.map(sanitizeItem);

    return res.status(200).json({
      success: true,
      count: sanitizedItems.length,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      items: sanitizedItems,
    });
  } catch (error) {
    console.error('Get items error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching items', error: error.message });
  }
};

export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ItemStore.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const handovers = await HandoverStore.findByItemId(item._id);

    return res.status(200).json({
      success: true,
      item: sanitizeItem(item),
      handovers,
    });
  } catch (error) {
    console.error('Get item by ID error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching item', error: error.message });
  }
};

export const scanLookup = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Scanned code is required' });
    }

    let searchCode = code.trim();

    // Check if code is JSON payload from QR
    if (searchCode.startsWith('{')) {
      try {
        const parsed = JSON.parse(searchCode);
        if (parsed.trackingCode) {
          searchCode = parsed.trackingCode;
        }
      } catch (e) {
        // Not JSON, continue with raw string
      }
    }

    let item = await ItemStore.findByTrackingCode(searchCode);
    if (!item) {
      item = await ItemStore.findById(searchCode);
    }

    if (!item) {
      return res.status(404).json({ success: false, message: `No item found matching "${searchCode}"` });
    }

    const handovers = await HandoverStore.findByItemId(item._id);

    return res.status(200).json({
      success: true,
      item: sanitizeItem(item),
      handovers,
    });
  } catch (error) {
    console.error('Scan lookup error:', error);
    return res.status(500).json({ success: false, message: 'Server error looking up scan', error: error.message });
  }
};

function generateFoodCoupon(quality) {
  const normQuality = String(quality || '').toLowerCase();
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();

  if (normQuality.includes('a') || normQuality.includes('excellent') || normQuality.includes('working')) {
    return {
      couponCode: `NITTE-DELUXE-${randomSuffix}`,
      grade: 'Grade A (Excellent / Working)',
      title: 'FREE DELUXE CAMPUS MEAL COMBO + COLD DRINK',
      value: '₹180',
      outlet: 'Nitte Central Food Court & Nescafe Lounge',
      description: '1x Complete Deluxe Hot Meal (Burger/Rice Bowl) + 1x Cold Beverage. 100% Free for contributing premium working e-waste.',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
      status: 'available',
      issuedAt: new Date(),
    };
  } else if (normQuality.includes('b') || normQuality.includes('good') || normQuality.includes('repairable')) {
    return {
      couponCode: `NITTE-FEAST-${randomSuffix}`,
      grade: 'Grade B (Good / Minor Wear)',
      title: 'FREE SPECIAL MASALA DOSA / GRILLED SANDWICH + JUICE',
      value: '₹100',
      outlet: 'Campus Cafeteria & Fast Food Center',
      description: '1x Special Masala Dosa or Toasted Sandwich + 1x Fresh Fruit Juice. 100% Free for dropping off repairable electronics.',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
      status: 'available',
      issuedAt: new Date(),
    };
  } else {
    return {
      couponCode: `NITTE-SNACK-${randomSuffix}`,
      grade: 'Grade C (Scrap / Recyclable)',
      title: 'FREE ICED COFFEE / CHAI & FRESH SAMOSA COMBO',
      value: '₹50',
      outlet: 'All Campus Food Kiosks & Cafeterias',
      description: '1x Cold Coffee or Hot Masala Chai + 2x Crispy Samosas. 100% Free for responsible e-waste recycling.',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
      status: 'available',
      issuedAt: new Date(),
    };
  }
}

export const collectItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualWeight, location = '', notes = '', conditionQuality = 'Grade B - Good / Repairable', otp } = req.body;

    const weightNum = parseFloat(actualWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide valid actual weight in kg' });
    }

    const item = await ItemStore.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Verify 4-digit Handover OTP if item has an OTP assigned
    if (item.otp && item.otp.trim().length > 0) {
      const cleanEnteredOtp = String(otp || '').trim();
      const cleanExpectedOtp = String(item.otp).trim();
      if (!cleanEnteredOtp || cleanEnteredOtp !== cleanExpectedOtp) {
        return res.status(400).json({
          success: false,
          message: `Invalid 4-digit Handover OTP. Please ask the submitter (${item.userName}) for their correct 4-digit security code.`,
        });
      }
    }

    // Calculate reward points: 10 points per kg collected!
    const pointsAwarded = Math.round(weightNum * 10);

    // Generate Instant Campus Food Coupon based on Hardware Quality
    const foodCoupon = generateFoodCoupon(conditionQuality);

    const updatedItem = await ItemStore.updateById(item._id, {
      actualWeight: weightNum,
      status: 'collected',
      location: location || item.location,
      conditionQuality,
      foodCoupon,
    });

    // Credit reward points to the student user
    if (item.userId) {
      await UserStore.addPoints(item.userId, pointsAwarded);
    }

    await HandoverStore.create({
      itemId: item._id,
      trackingCode: item.trackingCode,
      fromRole: 'student',
      toRole: 'collection_team',
      location: location || item.location,
      actorName: req.user.name,
      actorId: (req.user._id || req.user.id).toString(),
      verified: true,
      notes: `Collected by ${req.user.name}. Verified actual weight: ${weightNum} kg (${conditionQuality}). Issued Food Coupon: ${foodCoupon.couponCode} (${foodCoupon.title}). +${pointsAwarded} reward points credited to student. ${notes ? `(${notes})` : ''}`,
    });

    const handovers = await HandoverStore.findByItemId(item._id);

    // Trigger Real-Time Notifications
    // 1. Notify Student via real Email + SMS of collection & points & Food Coupon
    const studentUser = (await UserStore.findById(item.userId)) || {
      name: item.userName,
      email: item.userEmail,
      phone: item.userPhone || '+919876543210',
    };
    notificationService.notifyItemCollected(updatedItem, studentUser, req.user.name, pointsAwarded).catch(e => console.warn('Collect notif error:', e));

    // 2. Notify Admin that handover is pending verification
    const adminUser = (await UserStore.findByEmail('admin@ecoloop.campus')) || {
      name: 'Manan Sehgal',
      email: 'admin@ecoloop.campus',
      phone: '+919834567890',
    };
    notificationService.notifyAdminPendingHandover(updatedItem, adminUser, req.user.name).catch(e => console.warn('Admin pending handover notif error:', e));

    return res.status(200).json({
      success: true,
      message: `Item marked as collected! +${pointsAwarded} points credited & Campus Food Coupon issued (${foodCoupon.value}).`,
      pointsAwarded,
      foodCoupon,
      item: updatedItem,
      handovers,
    });
  } catch (error) {
    console.error('Collect item error:', error);
    return res.status(500).json({ success: false, message: 'Server error collecting item', error: error.message });
  }
};

export const handoverToRecycler = async (req, res) => {
  try {
    const { id } = req.params;
    const { recyclerName = 'Janavi Bairoliya (Authorised Recycler)', location = 'Campus Central Sorting Hub (Saupernikha)', notes = '' } = req.body;

    const item = await ItemStore.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const updatedItem = await ItemStore.updateById(item._id, {
      status: 'handed_over',
      location,
    });

    await HandoverStore.create({
      itemId: item._id,
      trackingCode: item.trackingCode,
      fromRole: req.user.role || 'admin',
      toRole: 'recycler',
      location,
      actorName: req.user.name,
      actorId: (req.user._id || req.user.id).toString(),
      verified: true,
      notes: `Batch handed over to authorised recycler: ${recyclerName}. ${notes ? `Notes: ${notes}` : ''}`,
    });

    const handovers = await HandoverStore.findByItemId(item._id);

    // Trigger Real-Time Notification: Notify Student that item is handed over to recycler
    const studentUser = (await UserStore.findById(item.userId)) || {
      name: item.userName,
      email: item.userEmail,
      phone: item.userPhone || '+919876543210',
    };
    notificationService.notifyItemHandedOver(updatedItem, studentUser, req.user.name, recyclerName).catch(e => console.warn('Handover notif error:', e));

    return res.status(200).json({
      success: true,
      message: `Item marked as handed over to ${recyclerName}`,
      item: updatedItem,
      handovers,
    });
  } catch (error) {
    console.error('Handover error:', error);
    return res.status(500).json({ success: false, message: 'Server error handing over item', error: error.message });
  }
};

export const recycleItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { facility = 'Govt. Authorised R2/e-Stewards Recycling Facility', notes = '' } = req.body;

    const item = await ItemStore.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const updatedItem = await ItemStore.updateById(item._id, {
      status: 'verified_recycled',
      location: facility,
    });

    await HandoverStore.create({
      itemId: item._id,
      trackingCode: item.trackingCode,
      fromRole: 'recycler',
      toRole: 'verified_recycled',
      location: facility,
      actorName: req.user.name,
      actorId: (req.user._id || req.user.id).toString(),
      verified: true,
      notes: `Certified recycled at ${facility}. Safe dismantling & material recovery completed. ${notes ? `(${notes})` : ''}`,
    });

    const handovers = await HandoverStore.findByItemId(item._id);

    // Trigger Real-Time Notification: Notify Student that item is verified recycled (closed loop certified!)
    const studentUser = (await UserStore.findById(item.userId)) || {
      name: item.userName,
      email: item.userEmail,
      phone: item.userPhone || '+919876543210',
    };
    notificationService.notifyItemVerifiedRecycled(updatedItem, studentUser, req.user.name, facility).catch(e => console.warn('Recycle notif error:', e));

    return res.status(200).json({
      success: true,
      message: 'Item verified as recycled successfully!',
      item: updatedItem,
      handovers,
    });
  } catch (error) {
    console.error('Recycle error:', error);
    return res.status(500).json({ success: false, message: 'Server error verifying recycling', error: error.message });
  }
};

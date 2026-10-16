import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'college', 'institutional', 'collector', 'admin', 'recycler', 'collection'],
      default: 'student',
    },
    institutionName: {
      type: String,
      default: 'NMAM Institute of Technology',
      trim: true,
    },
    hostel: {
      type: String,
      default: 'Nandani',
      trim: true,
    },
    department: {
      type: String,
      default: '',
      trim: true,
    },
    studentId: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    erpVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: true,
    },
    points: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const eWasteItemSchema = new mongoose.Schema(
  {
    trackingCode: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, default: '' },
    userEmail: { type: String, default: '' },
    userPhone: { type: String, default: '' },
    productName: { type: String, default: '', trim: true },
    customerType: {
      type: String,
      enum: ['student', 'college', 'individual', 'department'],
      default: 'student',
    },
    type: {
      type: String,
      required: true,
      enum: [
        'Laptop / Computer',
        'Mobile Phone / Tablet',
        'Charger & Cables',
        'Battery / Power Bank',
        'Circuit Board / PCB',
        'Monitor / TV Display',
        'Home Appliance',
        'Other Electronics',
      ],
    },
    approxWeight: { type: Number, required: true, min: 0.05 },
    actualWeight: { type: Number, default: null },
    photoUrl: { type: String, default: '' },
    qrCode: { type: String, default: '' },
    status: {
      type: String,
      enum: ['registered', 'scheduled', 'collected', 'handed_over', 'verified_recycled'],
      default: 'registered',
      index: true,
    },
    pickupDate: { type: String, default: '' },
    location: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const handoverSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'EWasteItem', required: true, index: true },
    trackingCode: { type: String, required: true },
    fromRole: { type: String, required: true },
    toRole: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    location: { type: String, default: '' },
    actorName: { type: String, default: '' },
    actorId: { type: String, default: '' },
    verified: { type: Boolean, default: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const notificationSchema = new mongoose.Schema(
  {
    recipientEmail: { type: String, default: '' },
    recipientPhone: { type: String, default: '' },
    recipientName: { type: String, default: '' },
    recipientRole: { type: String, default: 'student' },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    emailSent: { type: Boolean, default: false },
    emailProvider: { type: String, default: 'sendgrid' },
    emailMessageId: { type: String, default: '' },
    smsSent: { type: Boolean, default: false },
    smsProvider: { type: String, default: 'fast2sms' },
    smsMessageId: { type: String, default: '' },
    status: { type: String, default: 'delivered' },
    errorDetails: { type: String, default: '' },
    trackingCode: { type: String, default: '' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const partnerSchema = new mongoose.Schema(
  {
    orgName: { type: String, required: true, trim: true },
    orgType: {
      type: String,
      enum: ['municipality', 'ngo'],
      required: true,
    },
    registrationNumber: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: 'Karnataka', trim: true },
    contactPerson: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    officialAddress: { type: String, default: '', trim: true },
    website: { type: String, default: '', trim: true },
    verified: { type: Boolean, default: true },
    establishedYear: { type: Number, default: 2010 },
    activeDrivesCount: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const bulkPickupSchema = new mongoose.Schema(
  {
    referenceCode: { type: String, required: true, unique: true, index: true },
    partnerId: { type: String, default: '' },
    partnerName: { type: String, required: true },
    partnerType: { type: String, enum: ['municipality', 'ngo'], default: 'ngo' },
    city: { type: String, required: true },
    locationName: { type: String, required: true },
    driveTitle: { type: String, required: true },
    approxWeightKg: { type: Number, required: true, min: 5 },
    estimatedItemCount: { type: Number, default: 20 },
    categoryTypes: [{ type: String }],
    proposedDate: { type: String, required: true },
    contactPhone: { type: String, required: true },
    pickupAddress: { type: String, required: true },
    assignedCollector: { type: String, default: 'Piyush Raj (Campus Collection Lead)' },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'requested',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const apiKeySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    ownerEmail: { type: String, required: true, trim: true },
    role: { type: String, default: 'external_campus' },
    active: { type: Boolean, default: true },
    requestCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date, default: null },
    rateLimitPerMin: { type: Number, default: 120 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export const EWasteItemModel = mongoose.models.EWasteItem || mongoose.model('EWasteItem', eWasteItemSchema);
export const HandoverModel = mongoose.models.Handover || mongoose.model('Handover', handoverSchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export const PartnerModel = mongoose.models.Partner || mongoose.model('Partner', partnerSchema);
export const BulkPickupModel = mongoose.models.BulkPickup || mongoose.model('BulkPickup', bulkPickupSchema);
export const ApiKeyModel = mongoose.models.ApiKey || mongoose.model('ApiKey', apiKeySchema);



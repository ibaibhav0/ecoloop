import mongoose from 'mongoose';

// 1. User Schema
const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: '', trim: true },
    email: { type: String, default: '', lowercase: true, trim: true },
    role: {
      type: String,
      enum: ['student', 'collection', 'admin', 'recycler'],
      default: 'student',
      index: true,
    },
    hostel: { type: String, default: 'Nandani', trim: true },
    department: { type: String, default: 'Computer Science', trim: true },
    points: { type: Number, default: 0 },
    sessionState: {
      step: { type: String, default: null },
      draftItem: { type: Object, default: {} },
      updatedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

// 2. EWasteItem Schema
const eWasteItemSchema = new mongoose.Schema(
  {
    trackingCode: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userPhone: { type: String, required: true, index: true },
    userName: { type: String, default: '' },
    userHostel: { type: String, default: 'Nandani' },
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
        'Lab Equipment',
        'Other Electronics',
      ],
    },
    approxWeight: { type: Number, required: true, min: 0.01 },
    actualWeight: { type: Number, default: null },
    photoUrl: { type: String, default: '' },
    qrCodeData: { type: String, default: '' },
    qrCodeUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['registered', 'scheduled', 'collected', 'handed_over', 'verified_recycled'],
      default: 'registered',
      index: true,
    },
    pickupDate: { type: String, default: '' },
    location: { type: String, default: '' },
    assignedCollector: { type: String, default: '' },
    assignedRecycler: { type: String, default: '' },
    collectedAt: { type: Date, default: null },
    handedOverAt: { type: Date, default: null },
    recycledAt: { type: Date, default: null },
    eprCertificate: {
      certificateId: { type: String, default: '' },
      issuedAt: { type: Date, default: null },
      cpcbRecyclerName: { type: String, default: '' },
      cpcbRegNo: { type: String, default: '' },
      co2SavedKg: { type: Number, default: 0 },
      pdfUrl: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// 3. Handover Schema
const handoverSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'EWasteItem', required: true },
    trackingCode: { type: String, required: true, index: true },
    fromRole: { type: String, required: true },
    toRole: { type: String, required: true },
    actorPhone: { type: String, required: true },
    actorName: { type: String, default: '' },
    location: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    verified: { type: Boolean, default: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// 4. Recycler Directory Schema (Official CPCB Approved Recyclers)
const recyclerDirectorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    district: { type: String, default: '' },
    state: { type: String, required: true, trim: true },
    capacity: { type: String, required: true },
    capacityTpa: { type: Number, default: 0 },
    email: { type: String, required: true, trim: true },
    cpcbRegNumber: { type: String, default: '' },
    authorizedCategories: [{ type: String }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 5. Feedback Schema
const feedbackSchema = new mongoose.Schema(
  {
    userPhone: { type: String, required: true },
    trackingCode: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export const EWasteItemModel = mongoose.models.EWasteItem || mongoose.model('EWasteItem', eWasteItemSchema);
export const HandoverModel = mongoose.models.Handover || mongoose.model('Handover', handoverSchema);
export const RecyclerDirectoryModel =
  mongoose.models.RecyclerDirectory || mongoose.model('RecyclerDirectory', recyclerDirectorySchema);
export const FeedbackModel = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

// In-Memory Hybrid Store for maximum resilience if MongoDB is not connected
export class MemStore {
  static users = new Map();
  static items = new Map();
  static handovers = [];
  static recyclers = [];
  static feedbacks = [];
}

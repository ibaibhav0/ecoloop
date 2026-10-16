import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { UserStore, ItemStore, HandoverStore, ApiKeyStore } from './data/store.js';
import { connectDB } from './config/db.js';

export const seedDatabase = async (force = false) => {
  await connectDB();
  console.log('🌱 Seeding initial campus accounts for EcoLoop (zero items/stats)...');

  // Seed default active API keys for other campuses / external apps
  const existingKey = await ApiKeyStore.findByKey('ecoloop_live_public_key_2026_demo');
  if (!existingKey) {
    await ApiKeyStore.create({
      key: 'ecoloop_live_public_key_2026_demo',
      name: 'Public Integration Sandbox Key',
      ownerEmail: 'developer@ecoloop.campus',
      role: 'developer',
      notes: 'General public development and testing key',
    });
    await ApiKeyStore.create({
      key: 'ecoloop_live_campus_key_2026_mit_manipal',
      name: 'MIT Manipal Campus E-Waste System',
      ownerEmail: 'sustainability@manipal.edu',
      role: 'external_campus',
      notes: 'Federated collegiate integration for Manipal Academy of Higher Education',
    });
    await ApiKeyStore.create({
      key: 'ecoloop_live_campus_key_2026_nitk_surathkal',
      name: 'NITK Surathkal Green Initiative',
      ownerEmail: 'green.campus@nitk.edu.in',
      role: 'external_campus',
      notes: 'Coastal Karnataka inter-collegiate e-waste monitoring network',
    });
    console.log('🔑 Initial public API keys seeded successfully.');
  }

  const salt = await bcrypt.genSalt(10);
  const studentPw = await bcrypt.hash('student123', salt);
  const collectorPw = await bcrypt.hash('collector123', salt);
  const adminPw = await bcrypt.hash('admin123', salt);
  const recyclerPw = await bcrypt.hash('recycler123', salt);
  const collegePw = await bcrypt.hash('college123', salt);

  // Check if Baibhav Kumar already exists
  const existing = await UserStore.findByEmail('baibhav@ecoloop.campus');
  if (existing && !force) {
    console.log('⚡ User accounts already initialized.');
    return;
  }

  // 1. One Admin
  const admin = await UserStore.create({
    name: 'Manan Sehgal',
    email: 'admin@ecoloop.campus',
    phone: '+919834567890',
    password: adminPw,
    role: 'admin',
    hostel: 'Saupernikha',
    points: 0,
  });

  // 2. Students - Strictly initialized with 0 points until real recycling submissions
  const student1 = await UserStore.create({
    name: 'Baibhav Kumar',
    email: 'baibhav@ecoloop.campus',
    phone: '+919876543210',
    password: studentPw,
    role: 'student',
    hostel: 'Nandani',
    department: 'Computer Science & Engineering',
    studentId: '4NM22CS045',
    erpVerified: true,
    points: 0,
  });

  // Alias student@ecoloop.campus to Baibhav Kumar for 1-click test compatibility
  await UserStore.create({
    name: 'Baibhav Kumar',
    email: 'student@ecoloop.campus',
    phone: '+919876543210',
    password: studentPw,
    role: 'student',
    hostel: 'Nandani',
    department: 'Computer Science & Engineering',
    studentId: '4NM22CS045',
    erpVerified: true,
    points: 0,
  });

  const student2 = await UserStore.create({
    name: 'Ananya Iyer',
    email: 'ananya@ecoloop.campus',
    phone: '+919812345678',
    password: studentPw,
    role: 'student',
    hostel: 'Kaveri',
    department: 'Information Science & Engineering',
    studentId: '4NM22IS023',
    erpVerified: true,
    points: 0,
  });

  const student3 = await UserStore.create({
    name: 'Rohit Shetty',
    email: 'rohit@ecoloop.campus',
    phone: '+919834567890',
    password: studentPw,
    role: 'student',
    hostel: 'Kumardhara',
    department: 'Mechanical Engineering',
    studentId: '4NM22ME112',
    erpVerified: true,
    points: 0,
  });

  // 3. Collection Team
  const collector = await UserStore.create({
    name: 'Piyush Raj',
    email: 'collector@ecoloop.campus',
    phone: '+919823456789',
    password: collectorPw,
    role: 'collector',
    hostel: 'Kumardhara',
    points: 0,
  });

  // 4. Authorised Recycler
  const recycler = await UserStore.create({
    name: 'Janavi Bairoliya',
    email: 'recycler@ecoloop.campus',
    phone: '+919845678901',
    password: recyclerPw,
    role: 'recycler',
    hostel: 'Netravati',
    points: 0,
  });

  // 5. College / Academic Department Account
  await UserStore.create({
    name: 'Dept of Computer Science & Engineering',
    email: 'cse.hod@nmamit.campus',
    phone: '+918258281263',
    password: collegePw,
    role: 'college',
    institutionName: 'NMAM Institute of Technology (Nitte Deemed University)',
    department: 'Computer Science & Engineering',
    hostel: 'Yourspace',
    erpVerified: true,
    points: 0,
  });

  console.log('✅ Clean setup complete: 0 items, 0 handovers, 0 seeded points. Ready for real user entries.');
};

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase(true).then(() => process.exit(0));
}

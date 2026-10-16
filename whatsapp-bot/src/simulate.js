import { WebhookController } from './controllers/webhookController.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seed.js';
import { EWasteItemModel, UserModel, MemStore } from './models/index.js';

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function simulateMsg(from, text, profileName = 'Student Contributor', image = null) {
  console.log(`\n======================================================`);
  console.log(`📱 [USER -> BOT] (${from}) : "${text}"`);
  console.log(`======================================================`);

  const rawMsg = {
    id: `msg_${Date.now()}`,
    from,
    type: image ? 'image' : 'text',
    text: { body: text },
    image,
    timestamp: String(Math.floor(Date.now() / 1000)),
  };

  await WebhookController.processSingleMessage(rawMsg, profileName);
  await delay(120);
}

async function runEndToEndSimulation() {
  console.log('⚡ [EcoLoop Simulator] Initializing end-to-end multi-role test...');
  await connectDB();
  await seedDatabase();

  const studentPhone = '919876543210';
  const collectorPhone = '919888877770';
  const adminPhone = '919999900000';
  const recyclerPhone = '919777766660';

  console.log('\n--- 1. STUDENT REGISTRATION FLOW ---');
  // 1. Initial Greeting
  await simulateMsg(studentPhone, 'Hi', 'Vaibhav Sharma');

  // 2. Name
  await simulateMsg(studentPhone, 'Vaibhav Sharma');

  // 3. Email
  await simulateMsg(studentPhone, 'vaibhav@campus.edu');

  // 4. Hostel Selection
  await simulateMsg(studentPhone, 'Nandani Hostel');

  // 5. Department
  await simulateMsg(studentPhone, 'Computer Science');

  console.log('\n--- 2. E-WASTE REGISTRATION & QR CREATION ---');
  // 6. Register Item
  await simulateMsg(studentPhone, 'Register');

  // 7. Category
  await simulateMsg(studentPhone, 'Laptop / Computer');

  // 8. Weight
  await simulateMsg(studentPhone, '2.4');

  // 9. Photo Skip (Direct to QR code generation)
  await simulateMsg(studentPhone, 'Skip');

  // Find generated item
  let items = [];
  try {
    items = await EWasteItemModel.find({ userPhone: studentPhone }).lean();
  } catch (e) {
    items = Array.from(MemStore.items.values()).filter((i) => i.userPhone === studentPhone);
  }

  const registeredItem = items[0];
  if (!registeredItem) {
    console.error('❌ Error: Registered item not found in DB!');
    return;
  }

  const trackingCode = registeredItem.trackingCode;
  console.log(`\n🎉 Generated Item Tracking Code: [${trackingCode}]`);

  console.log('\n--- 3. SCHEDULE PICKUP FLOW ---');
  // 10. Schedule slot
  await simulateMsg(studentPhone, 'Schedule');
  await simulateMsg(studentPhone, 'Tomorrow at 5:00 PM at Nandani Reception');

  // Check Status
  await simulateMsg(studentPhone, 'Status');

  console.log('\n--- 4. COLLECTION TEAM VERIFICATION & WEIGHING ---');
  // Switch to collection team role
  await simulateMsg(collectorPhone, 'ROLE COLLECTION', 'Piyush (Lead Collector)');
  await simulateMsg(collectorPhone, 'Pending');

  // Collector scans QR
  await simulateMsg(collectorPhone, 'Scan');
  await simulateMsg(collectorPhone, trackingCode); // Provide tracking code or decoded QR

  // Calibrate weight
  await simulateMsg(collectorPhone, '2.45');

  console.log('\n--- 5. ADMIN DASHBOARD & RECYCLER HANDOVER ---');
  // Switch to admin role
  await simulateMsg(adminPhone, 'ROLE ADMIN', 'Campus Sustainability Head');
  await simulateMsg(adminPhone, 'Dashboard');
  await simulateMsg(adminPhone, 'Handover');
  await simulateMsg(adminPhone, 'M/s WB E-Waste Control Management Pvt. Ltd.');
  await simulateMsg(adminPhone, 'Report'); // Generates NAAC Accreditation Report PDF

  console.log('\n--- 6. RECYCLER STATUTORY DESTRUCTION & EPR CERTIFICATE ---');
  // Switch to recycler role
  await simulateMsg(recyclerPhone, 'ROLE RECYCLER', 'Kasim (WB E-Waste Facility)');
  await simulateMsg(recyclerPhone, 'Verify');
  await simulateMsg(recyclerPhone, trackingCode);
  await simulateMsg(recyclerPhone, 'History');

  console.log('\n--- 7. STUDENT REWARD VERIFICATION ---');
  // Check student points after verified recycling
  await simulateMsg(studentPhone, 'Points');
  await simulateMsg(studentPhone, 'Status');
  await simulateMsg(studentPhone, 'Leaderboard');

  console.log(`\n======================================================`);
  console.log(`✅ [SIMULATION SUCCESSFUL] All 4 roles executed end-to-end!`);
  console.log(`======================================================\n`);
  process.exit(0);
}

runEndToEndSimulation().catch((err) => {
  console.error('Simulation error:', err);
  process.exit(1);
});

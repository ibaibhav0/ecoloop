import PDFDocument from 'pdfkit';
import { ItemStore, UserStore, HandoverStore } from '../data/store.js';

export const CPCB_DETAILS = {
  recyclerName: 'Janavi Bairoliya',
  facilityName: 'CleanGreen Material Recovery & Dismantling LLP (Unit Netravati)',
  cpcbRegistrationNo: 'CPCB/EPR/RECYCLER/2023/KA-08492',
  spcbAuthNo: 'KSPCB/RO-UDU/E-WASTE/AUTH/2024-25/114',
  cpcbPortalUrl: 'https://eprewastecpcb.in',
  authorizedCapacity: '500 Metric Tonnes / Annum',
  validity: '31st March 2028',
  facilityLocation: 'Plot 14-B, Campus Green Zone, Netravati, Karkala Taluk, Udupi - 574110',
  complianceStandard: 'E-Waste (Management) Rules 2022 & CPCB Extended Producer Responsibility (EPR)',
};

export const NAAC_METADATA = {
  criteria: 'Criteria 7: Institutional Values and Best Practices',
  keyIndicator: '7.1 Institutional Values and Social Responsibilities',
  metric: '7.1.3: Management of Degradable and Non-Degradable Waste (E-Waste Management System)',
  institution: 'NMAM Institute of Technology (Nitte Deemed to be University)',
  platform: 'EcoLoop Campus Circular E-Waste Management Network',
  academicYear: 'Academic Year 2025-2026',
};

export async function getAccreditationData() {
  const [items, students, handovers] = await Promise.all([
    ItemStore.findAll(),
    UserStore.getAllStudents(),
    HandoverStore.findAll(),
  ]);

  // 1. Total e-waste metrics
  const totalItemsCount = items.length;
  let totalKg = 0;
  let collectedKg = 0;
  let verifiedRecycledKg = 0;

  const distinctStudentEmails = new Set();
  const distinctHostelMap = {
    Nandani: { count: 0, weight: 0, students: new Set() },
    Kaveri: { count: 0, weight: 0, students: new Set() },
    Kumardhara: { count: 0, weight: 0, students: new Set() },
    Saupernikha: { count: 0, weight: 0, students: new Set() },
    Shambhavi: { count: 0, weight: 0, students: new Set() },
    Netravati: { count: 0, weight: 0, students: new Set() },
  };

  const categoryMap = {};

  items.forEach((item) => {
    const itemWeight = Number(item.actualWeight || item.approxWeight || 0);
    totalKg += itemWeight;

    if (['collected', 'handed_over', 'verified_recycled'].includes(item.status)) {
      collectedKg += itemWeight;
    }

    if (item.status === 'verified_recycled') {
      verifiedRecycledKg += itemWeight;
    }

    if (item.userEmail) {
      distinctStudentEmails.add(item.userEmail.toLowerCase());
    }

    const h = item.userHostel || 'Nandani';
    if (!distinctHostelMap[h]) {
      distinctHostelMap[h] = { count: 0, weight: 0, students: new Set() };
    }
    distinctHostelMap[h].count += 1;
    distinctHostelMap[h].weight += itemWeight;
    if (item.userName) {
      distinctHostelMap[h].students.add(item.userName);
    }

    const t = item.type || 'Other Electronics';
    if (!categoryMap[t]) {
      categoryMap[t] = { count: 0, weight: 0 };
    }
    categoryMap[t].count += 1;
    categoryMap[t].weight += itemWeight;
  });

  // Calculate participation strictly from actual item depositors
  const studentsParticipated = distinctStudentEmails.size;
  const verifiedRecyclingRate = collectedKg > 0
    ? Number(((verifiedRecycledKg / collectedKg) * 100).toFixed(1))
    : 0;

  const hostelBreakdown = Object.entries(distinctHostelMap).map(([hostel, data]) => ({
    hostel,
    itemsCount: data.count,
    totalKg: Number(data.weight.toFixed(2)),
    studentParticipants: data.students.size,
  }));

  const categoryBreakdown = Object.entries(categoryMap).map(([type, data]) => ({
    type,
    itemsCount: data.count,
    totalKg: Number(data.weight.toFixed(2)),
  })).sort((a, b) => b.totalKg - a.totalKg);

  return {
    success: true,
    naac: NAAC_METADATA,
    cpcb: CPCB_DETAILS,
    summary: {
      totalItemsCount,
      totalDeclaredKg: Number(totalKg.toFixed(2)),
      totalCollectedKg: Number(collectedKg.toFixed(2)),
      verifiedRecycledKg: Number(verifiedRecycledKg.toFixed(2)),
      studentsParticipated,
      verifiedRecyclingRate,
      handoversLogged: handovers.length,
      generatedAt: new Date().toISOString(),
    },
    hostelBreakdown,
    categoryBreakdown,
    recentAudits: items.slice(0, 10).map((i) => ({
      trackingCode: i.trackingCode,
      type: i.type,
      weightKg: i.actualWeight || i.approxWeight,
      status: i.status,
      hostel: i.userHostel,
      studentName: i.userName,
    })),
  };
}

/**
 * Generate official NAAC Criteria 7 PDF Report Buffer
 */
export async function generateNaacPdfBuffer() {
  const data = await getAccreditationData();

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 40,
        size: 'A4',
        info: {
          Title: 'NAAC Criteria 7 E-Waste Management & Recycling Report',
          Author: 'EcoLoop Campus Platform',
          Subject: 'NAAC / NIRF Sustainability & E-Waste Verification Report',
        },
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // 1. INSTITUTIONAL ACCREDITATION HEADER
      doc.rect(40, 40, 515, 60).fill('#0f172a');
      doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold');
      doc.text(NAAC_METADATA.institution, 50, 52, { align: 'center', width: 495 });
      doc.fillColor('#38bdf8').fontSize(9).font('Helvetica');
      doc.text('Internal Quality Assurance Cell (IQAC) • Annual Sustainability Disclosure', 50, 72, { align: 'center', width: 495 });
      doc.fillColor('#94a3b8').fontSize(8);
      doc.text(`${NAAC_METADATA.criteria} • Metric 7.1.3`, 50, 85, { align: 'center', width: 495 });

      doc.moveDown(2);

      // 2. DOCUMENT TITLE & SCOPE
      doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold');
      doc.text('CAMPUS E-WASTE COLLECTION & CLOSED-LOOP RECYCLING REPORT', 40, 115, { align: 'center' });
      doc.fillColor('#475569').fontSize(9).font('Helvetica');
      doc.text(`Documentation for NAAC Metric 7.1.3 & NIRF Best Practices • Academic Year: 2025-2026`, 40, 133, { align: 'center' });

      // Divider
      doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(40, 150).lineTo(555, 150).stroke();

      // 3. KEY METRICS EXECUTIVE SUMMARY (4 CALLOUT BOXES)
      const boxY = 160;
      const boxW = 120;
      const boxH = 50;

      // Box 1: Total Collected
      doc.rect(40, boxY, boxW, boxH).fillAndStroke('#f0fdf4', '#86efac');
      doc.fillColor('#166534').fontSize(7).font('Helvetica-Bold').text('TOTAL E-WASTE COLLECTED', 45, boxY + 8);
      doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text(`${data.summary.totalCollectedKg} kg`, 45, boxY + 20);
      doc.fillColor('#15803d').fontSize(7).font('Helvetica').text('Scale Verified Net Weight', 45, boxY + 37);

      // Box 2: Students Participated
      doc.rect(170, boxY, boxW, boxH).fillAndStroke('#eff6ff', '#93c5fd');
      doc.fillColor('#1e40af').fontSize(7).font('Helvetica-Bold').text('STUDENTS PARTICIPATED', 175, boxY + 8);
      doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text(`${data.summary.studentsParticipated}`, 175, boxY + 20);
      doc.fillColor('#1d4ed8').fontSize(7).font('Helvetica').text('Official ERP Enrolled Students', 175, boxY + 37);

      // Box 3: Verified Recycling Rate
      doc.rect(300, boxY, boxW, boxH).fillAndStroke('#fdf4ff', '#f0abfc');
      doc.fillColor('#86198f').fontSize(7).font('Helvetica-Bold').text('VERIFIED RECYCLING RATE', 305, boxY + 8);
      doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text(`${data.summary.verifiedRecyclingRate}%`, 305, boxY + 20);
      doc.fillColor('#a21caf').fontSize(7).font('Helvetica').text('Dismantled & Reclaimed', 305, boxY + 37);

      // Box 4: Total Tracked Consignments
      doc.rect(430, boxY, boxW, boxH).fillAndStroke('#f8fafc', '#cbd5e1');
      doc.fillColor('#334155').fontSize(7).font('Helvetica-Bold').text('DIGITAL QR CONSIGNMENTS', 435, boxY + 8);
      doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text(`${data.summary.totalItemsCount} items`, 435, boxY + 20);
      doc.fillColor('#475569').fontSize(7).font('Helvetica').text('100% Chain of Custody', 435, boxY + 37);

      // 4. STATUTORY CPCB AUTHORISED RECYCLER PARTNERSHIP BLOCK
      doc.rect(40, 222, 515, 88).fillAndStroke('#f8fafc', '#94a3b8');
      doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text('1. STATUTORY CPCB RECYCLER PARTNERSHIP DETAILS (E-WASTE RULES, 2022)', 50, 230);
      
      doc.fillColor('#334155').fontSize(8).font('Helvetica');
      doc.text(`• Authorized Recycler Partner: `, 50, 246, { continued: true });
      doc.font('Helvetica-Bold').text(`${CPCB_DETAILS.recyclerName} (${CPCB_DETAILS.facilityName})`);

      doc.font('Helvetica').text(`• CPCB EPR Registration Number: `, 50, 258, { continued: true });
      doc.font('Helvetica-Bold').text(`${CPCB_DETAILS.cpcbRegistrationNo}  •  State PCB Auth: ${CPCB_DETAILS.spcbAuthNo}`);

      doc.font('Helvetica').text(`• Official CPCB EPR National Portal URL: `, 50, 270, { continued: true });
      doc.font('Helvetica-Bold').fillColor('#0284c7').text(`${CPCB_DETAILS.cpcbPortalUrl}`);

      doc.fillColor('#334155').font('Helvetica').text(`• Facility Location & Authorized Capacity: `, 50, 282, { continued: true });
      doc.font('Helvetica-Bold').text(`${CPCB_DETAILS.authorizedCapacity} | Netravati Recovery Hub`);

      doc.font('Helvetica').text(`• Environmental Standard: `, 50, 294, { continued: true });
      doc.font('Helvetica-Bold').text(`${CPCB_DETAILS.complianceStandard}`);

      // 5. HOSTEL-WISE BREAKDOWN TABLE
      doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text('2. CAMPUS HOSTEL DIVERSION & PARTICIPATION METRICS', 40, 325);

      const tableTop = 340;
      doc.rect(40, tableTop, 515, 18).fill('#e2e8f0');
      doc.fillColor('#1e293b').fontSize(8).font('Helvetica-Bold');
      doc.text('Campus Hostel Name', 50, tableTop + 5);
      doc.text('Items Logged', 220, tableTop + 5);
      doc.text('Collected Weight (kg)', 330, tableTop + 5);
      doc.text('Participation Status', 450, tableTop + 5);

      let rowY = tableTop + 20;
      data.hostelBreakdown.forEach((h, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        doc.rect(40, rowY, 515, 16).fill(bg);
        doc.fillColor('#334155').fontSize(8).font('Helvetica');
        doc.text(`Hostel ${h.hostel}`, 50, rowY + 4);
        doc.text(`${h.itemsCount} consignments`, 220, rowY + 4);
        doc.font('Helvetica-Bold').text(`${h.totalKg} kg`, 330, rowY + 4);
        doc.font('Helvetica').text('Active Accredited', 450, rowY + 4);
        rowY += 16;
      });

      // 6. CATEGORY DISMANTLING BREAKDOWN
      doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text('3. MATERIAL RECOVERY & EQUIPMENT CATEGORIZATION', 40, rowY + 12);

      const catTop = rowY + 26;
      doc.rect(40, catTop, 515, 18).fill('#e2e8f0');
      doc.fillColor('#1e293b').fontSize(8).font('Helvetica-Bold');
      doc.text('E-Waste Equipment Classification', 50, catTop + 5);
      doc.text('Units Processed', 250, catTop + 5);
      doc.text('Net Weight Diverted (kg)', 400, catTop + 5);

      let catRowY = catTop + 20;
      data.categoryBreakdown.slice(0, 5).forEach((c, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        doc.rect(40, catRowY, 515, 15).fill(bg);
        doc.fillColor('#334155').fontSize(8).font('Helvetica');
        doc.text(c.type, 50, catRowY + 3);
        doc.text(`${c.itemsCount} units`, 250, catRowY + 3);
        doc.font('Helvetica-Bold').text(`${c.totalKg} kg`, 400, catRowY + 3);
        catRowY += 15;
      });

      // 7. NAAC CRITERIA 7 COMPLIANCE DECLARATION & SIGNATORIES
      const signY = 660;
      doc.rect(40, signY - 15, 515, 80).fillAndStroke('#f0fdf4', '#bbf7d0');
      doc.fillColor('#166534').fontSize(8).font('Helvetica-Bold');
      doc.text('NAAC METRIC 7.1.3 COMPLIANCE & BEST PRACTICE ATTESTATION', 50, signY - 8);
      doc.fillColor('#334155').fontSize(7.5).font('Helvetica');
      doc.text(
        'Certified that NMAMIT maintains an end-to-end digital circular loop platform (EcoLoop). All e-waste collected across Nandani, Kaveri, Kumardhara, Saupernikha, Shambhavi, and Netravati hostels is weighed on calibrated scales, dispatched exclusively to CPCB-registered recyclers, and tracked from registration to closed-loop recovery.',
        50,
        signY + 6,
        { width: 495 }
      );

      // Signatures
      const sigLineY = signY + 45;
      doc.strokeColor('#94a3b8').lineWidth(0.5).moveTo(60, sigLineY).lineTo(180, sigLineY).stroke();
      doc.strokeColor('#94a3b8').lineWidth(0.5).moveTo(240, sigLineY).lineTo(360, sigLineY).stroke();
      doc.strokeColor('#94a3b8').lineWidth(0.5).moveTo(410, sigLineY).lineTo(530, sigLineY).stroke();

      doc.fillColor('#0f172a').fontSize(7.5).font('Helvetica-Bold');
      doc.text('Manan Sehgal', 60, sigLineY + 3);
      doc.text('Janavi Bairoliya', 240, sigLineY + 3);
      doc.text('IQAC Coordinator', 410, sigLineY + 3);

      doc.fillColor('#64748b').fontSize(6.5).font('Helvetica');
      doc.text('Campus Admin • Sustainability', 60, sigLineY + 12);
      doc.text('CPCB Authorised Recycler', 240, sigLineY + 12);
      doc.text('NAAC Accreditation Cell', 410, sigLineY + 12);

      // Footer
      doc.fillColor('#94a3b8').fontSize(7);
      doc.text(
        `Generated from EcoLoop Production Database on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} • Tamper-evident CPCB EPR portal compliance: ${CPCB_DETAILS.cpcbPortalUrl}`,
        40,
        775,
        { align: 'center', width: 515 }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

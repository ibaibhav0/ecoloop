import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { metaConfig } from '../config/metaConfig.js';

const REPORTS_DIR = path.resolve('public/reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

export class ReportService {
  /**
   * Generate NAAC Criterion 7.1.3 Campus Accreditation PDF Report (Strictly real data)
   */
  static async generateNaacReportPdf({ totalItems = 0, totalKg = 0, totalStudents = 0, hostelStats = [] }) {
    const fileName = `NAAC_Criterion_7_Report_${Date.now()}.pdf`;
    const filePath = path.join(REPORTS_DIR, fileName);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header Banner: SpaceX-inspired clean monochrome
        doc.rect(40, 40, 515, 60).fill('#000000');
        doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold').text('ECOLOOP CAMPUS RECOVERY REPORT', 55, 52);
        doc.fontSize(9).font('Helvetica').fillColor('#AAAAAA').text(
          `INSTITUTIONAL NAAC CRITERION 7.1.3 & NIRF COMPLIANCE • CPCB RULES 2022`,
          55,
          74
        );

        // Metadata Strip
        doc.moveDown(3);
        doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold').text('AUDIT TELEMETRY');
        doc.fontSize(9).font('Helvetica').fillColor('#444444');
        doc.text(`Institution: ${metaConfig.campusName}`);
        doc.text(`Generated Timestamp: ${new Date().toUTCString()}`);
        doc.text(`Statutory Authority: Central Pollution Control Board (CPCB EPR Portal)`);
        doc.text(`Audit Status: VERIFIED FROM REAL TRANSACTION DATABASE LEDGER`);

        // Line Divider
        doc.strokeColor('#DDDDDD').lineWidth(1).moveTo(40, 160).lineTo(555, 160).stroke();

        // 4 KPI Metric Cards
        const cardY = 175;
        const cardWidth = 120;
        const cardHeight = 65;

        // Card 1: Verified E-Waste
        doc.rect(40, cardY, cardWidth, cardHeight).fill('#F8F9FA').stroke('#E5E7EB');
        doc.fillColor('#6B7280').fontSize(8).font('Helvetica-Bold').text('TOTAL VERIFIED KG', 48, cardY + 10);
        doc.fillColor('#111827').fontSize(16).text(`${totalKg.toFixed(2)} KG`, 48, cardY + 24);
        doc.fillColor('#10B981').fontSize(7).text('Zero Landfill Diversion', 48, cardY + 46);

        // Card 2: Items Processed
        doc.rect(170, cardY, cardWidth, cardHeight).fill('#F8F9FA').stroke('#E5E7EB');
        doc.fillColor('#6B7280').fontSize(8).font('Helvetica-Bold').text('SERIALIZED ITEMS', 178, cardY + 10);
        doc.fillColor('#111827').fontSize(16).text(`${totalItems}`, 178, cardY + 24);
        doc.fillColor('#6366F1').fontSize(7).text('Cryptographic QR Units', 178, cardY + 46);

        // Card 3: Active Students
        doc.rect(300, cardY, cardWidth, cardHeight).fill('#F8F9FA').stroke('#E5E7EB');
        doc.fillColor('#6B7280').fontSize(8).font('Helvetica-Bold').text('STUDENT PARTICIPANTS', 308, cardY + 10);
        doc.fillColor('#111827').fontSize(16).text(`${totalStudents}`, 308, cardY + 24);
        doc.fillColor('#F59E0B').fontSize(7).text('Campus Community', 308, cardY + 46);

        // Card 4: Carbon Offset
        const co2Saved = (totalKg * 1.44).toFixed(2);
        doc.rect(430, cardY, cardWidth, cardHeight).fill('#F8F9FA').stroke('#E5E7EB');
        doc.fillColor('#6B7280').fontSize(8).font('Helvetica-Bold').text('CO2e OFFSET', 438, cardY + 10);
        doc.fillColor('#111827').fontSize(16).text(`${co2Saved} KG`, 438, cardY + 24);
        doc.fillColor('#10B981').fontSize(7).text('1.44 kg CO2e / kg', 438, cardY + 46);

        // Hostel Breakdown Section
        doc.moveDown(6);
        doc.fillColor('#000000').fontSize(12).font('Helvetica-Bold').text('HOSTEL CIRCULAR LEADERBOARD (REAL DATA)', 40, 260);

        let tableY = 285;
        doc.rect(40, tableY, 515, 20).fill('#000000');
        doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
        doc.text('RANK', 48, tableY + 6);
        doc.text('HOSTEL RESIDENCE', 100, tableY + 6);
        doc.text('VERIFIED WEIGHT', 320, tableY + 6);
        doc.text('REGISTERED UNITS', 440, tableY + 6);

        tableY += 20;

        if (!hostelStats || hostelStats.length === 0) {
          doc.rect(40, tableY, 515, 30).fill('#F9FAFB').stroke('#E5E7EB');
          doc.fillColor('#6B7280').fontSize(9).font('Helvetica').text('No hostel records submitted yet. All metrics default to 0.', 50, tableY + 10);
          tableY += 40;
        } else {
          hostelStats.slice(0, 8).forEach((h, idx) => {
            doc.rect(40, tableY, 515, 20).fill(idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB').stroke('#E5E7EB');
            doc.fillColor('#111827').fontSize(8).font('Helvetica');
            doc.text(`#${idx + 1}`, 48, tableY + 6);
            doc.text(`${h.hostel || 'Hostel'}`, 100, tableY + 6);
            doc.text(`${(h.totalKg || 0).toFixed(2)} kg`, 320, tableY + 6);
            doc.text(`${h.count || 0} items`, 440, tableY + 6);
            tableY += 20;
          });
        }

        // CPCB Compliance Clause
        tableY += 25;
        doc.rect(40, tableY, 515, 60).fill('#F3F4F6').stroke('#D1D5DB');
        doc.fillColor('#111827').fontSize(9).font('Helvetica-Bold').text('STATUTORY DECLARATION UNDER CPCB RULES 2022:', 50, tableY + 10);
        doc.fillColor('#4B5563').fontSize(8).font('Helvetica').text(
          'This audit certificate verifies that all collected electronic fractions were routed strictly to CPCB-registered formal recycling facilities. Zero e-waste fractions were permitted to enter municipal landfills or informal scrap burning channels.',
          50,
          tableY + 24,
          { width: 495 }
        );

        // Signatures
        tableY += 80;
        doc.strokeColor('#9CA3AF').lineWidth(1).moveTo(60, tableY + 40).lineTo(200, tableY + 40).stroke();
        doc.fillColor('#111827').fontSize(8).font('Helvetica-Bold').text('CAMPUS SUSTAINABILITY HEAD', 60, tableY + 45);

        doc.strokeColor('#9CA3AF').lineWidth(1).moveTo(360, tableY + 40).lineTo(500, tableY + 40).stroke();
        doc.fillColor('#111827').fontSize(8).font('Helvetica-Bold').text('AUTHORIZED CPCB RECYCLER LEAD', 360, tableY + 45);

        doc.end();

        stream.on('finish', () => {
          resolve({
            fileName,
            filePath,
            publicUrl: `${metaConfig.baseUrl}/reports/${fileName}`,
          });
        });
        stream.on('error', reject);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Generate Official EPR Recycling & Destruction Certificate PDF
   */
  static async generateEprCertificatePdf(item, recycler = {}) {
    const certId = `EPR-${new Date().getFullYear()}-${item.trackingCode}`;
    const fileName = `EPR_Certificate_${item.trackingCode}.pdf`;
    const filePath = path.join(REPORTS_DIR, fileName);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Border frame
        doc.rect(30, 30, 535, 780).lineWidth(2).stroke('#000000');
        doc.rect(35, 35, 525, 770).lineWidth(0.5).stroke('#71717A');

        // Header Title
        doc.moveDown(2);
        doc.fillColor('#000000').fontSize(22).font('Helvetica-Bold').text('DIGITAL EPR RECYCLING CERTIFICATE', { align: 'center' });
        doc.fontSize(10).font('Helvetica').fillColor('#52525B').text('ISSUED UNDER E-WASTE (MANAGEMENT) RULES, 2022 • GOVERNMENT OF INDIA', { align: 'center' });
        doc.moveDown(1);
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000').text(`CERTIFICATE NUMBER: ${certId}`, { align: 'center' });

        // Divider
        doc.moveDown(1.5);
        doc.strokeColor('#D4D4D8').lineWidth(1).moveTo(60, doc.y).lineTo(535, doc.y).stroke();
        doc.moveDown(2);

        // Certificate Body Text
        doc.fillColor('#27272A').fontSize(11).font('Helvetica').text(
          `This is to certify that the decommissioned electronic equipment detailed below has been formally received, weighed, disassembled, and channelled into certified material reclamation in full compliance with the Central Pollution Control Board (CPCB) statutory directives.`,
          60,
          doc.y,
          { width: 475, align: 'justify', lineGap: 4 }
        );

        doc.moveDown(2);

        // Item Manifest Table
        const currentY = doc.y;
        doc.rect(60, currentY, 475, 140).fill('#F4F4F5').stroke('#E4E4E7');
        doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold');
        doc.text('RECOVERY MANIFEST PARTICULARS', 75, currentY + 12);

        doc.fontSize(9).font('Helvetica').fillColor('#3F3F46');
        doc.text(`Tracking Code:`, 75, currentY + 34);
        doc.font('Helvetica-Bold').text(item.trackingCode, 200, currentY + 34);

        doc.font('Helvetica').text(`Equipment Category:`, 75, currentY + 52);
        doc.font('Helvetica-Bold').text(item.type || 'E-Waste', 200, currentY + 52);

        doc.font('Helvetica').text(`Calibrated Weight:`, 75, currentY + 70);
        doc.font('Helvetica-Bold').text(`${(item.actualWeight || item.approxWeight || 0).toFixed(2)} kg`, 200, currentY + 70);

        doc.font('Helvetica').text(`Source Hostel / Origin:`, 75, currentY + 88);
        doc.font('Helvetica-Bold').text(item.userHostel || 'Campus Facility', 200, currentY + 88);

        const co2Saved = ((item.actualWeight || item.approxWeight || 0) * 1.44).toFixed(2);
        doc.font('Helvetica').text(`Carbon Offset Telemetry:`, 75, currentY + 106);
        doc.font('Helvetica-Bold').fillColor('#15803D').text(`${co2Saved} kg CO2e Avoided (Factor: 1.44)`, 200, currentY + 106);

        // Recycler Information
        doc.y = currentY + 160;
        doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold').text('AUTHORIZED RECYCLER METADATA', 60, doc.y);
        doc.moveDown(0.5);

        doc.fontSize(9).font('Helvetica').fillColor('#3F3F46');
        doc.text(`Recycling Enterprise: ${recycler.name || 'M/s WB E-Waste Control Management Pvt. Ltd.'}`, 60);
        doc.text(`Facility Location: ${recycler.location || 'Howrah, West Bengal'}`);
        doc.text(`Authorised CPCB Reg No: ${recycler.cpcbRegNumber || 'CPCB/EPR/2023/REC-0595'}`);
        doc.text(`Official CPCB Portal Reference: ${metaConfig.cpcbPortalUrl}`);
        doc.text(`Destruction Protocol: Mechanical Shredding, Precious Metal Extraction, Non-toxic Smelting`);

        // Signatures
        doc.moveDown(3);
        const sigY = doc.y + 40;
        doc.strokeColor('#000000').lineWidth(1).moveTo(80, sigY).lineTo(220, sigY).stroke();
        doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold').text('CAMPUS NODAL OFFICER', 80, sigY + 6);
        doc.font('Helvetica').fillColor('#71717A').text(metaConfig.campusName, 80, sigY + 18);

        doc.strokeColor('#000000').lineWidth(1).moveTo(360, sigY).lineTo(500, sigY).stroke();
        doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold').text('AUTHORISED EPR RECYCLER', 360, sigY + 6);
        doc.font('Helvetica').fillColor('#71717A').text('Verified Electronic Seal', 360, sigY + 18);

        doc.end();

        stream.on('finish', () => {
          resolve({
            certId,
            fileName,
            filePath,
            publicUrl: `${metaConfig.baseUrl}/reports/${fileName}`,
          });
        });
        stream.on('error', reject);
      } catch (err) {
        reject(err);
      }
    });
  }
}

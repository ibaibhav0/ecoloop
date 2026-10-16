import { getAccreditationData, generateNaacPdfBuffer } from '../services/reportService.js';

export const getNaacReportData = async (req, res) => {
  try {
    const data = await getAccreditationData();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching NAAC accreditation data:', error);
    return res.status(500).json({ success: false, message: 'Server error generating accreditation data', error: error.message });
  }
};

export const downloadNaacPdf = async (req, res) => {
  try {
    const pdfBuffer = await generateNaacPdfBuffer();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="NAAC_Criteria_7_E-Waste_Accreditation_Report_2026.pdf"'
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating NAAC PDF:', error);
    return res.status(500).json({ success: false, message: 'Server error generating PDF report', error: error.message });
  }
};

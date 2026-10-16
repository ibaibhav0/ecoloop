import { campusErpService } from '../services/campusErpService.js';

export const lookupStudent = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide student email to lookup' });
    }

    const result = await campusErpService.lookupStudent(email);
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('[ERP Controller] Lookup error:', error);
    return res.status(500).json({ success: false, message: 'Server error looking up student in ERP', error: error.message });
  }
};

export const getErpStatus = async (req, res) => {
  try {
    const status = campusErpService.getStatus();
    return res.status(200).json({ success: true, ...status });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getAllErpStudents = async (req, res) => {
  try {
    const students = campusErpService.getAllStudents();
    return res.status(200).json({ success: true, count: students.length, students });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const uploadRosterCsv = async (req, res) => {
  try {
    const { csvText } = req.body;
    if (!csvText || typeof csvText !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid or missing csvText string in request body' });
    }

    const result = await campusErpService.updateRosterCsv(csvText);
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error uploading CSV', error: error.message });
  }
};

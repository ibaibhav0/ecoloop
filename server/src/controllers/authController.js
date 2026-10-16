import bcrypt from 'bcryptjs';
import { UserStore } from '../data/store.js';
import { generateToken } from '../middleware/auth.js';
import { campusErpService } from '../services/campusErpService.js';
import { otpService } from '../services/otpService.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const normEmail = email.toLowerCase().trim();

    // 1. Validate real campus email domain
    const domainCheck = campusErpService.isValidCampusDomain(normEmail);
    if (!domainCheck.valid) {
      return res.status(400).json({
        success: false,
        message: domainCheck.message,
      });
    }

    // 2. Check if account already exists
    const existingUser = await UserStore.findByEmail(normEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this campus email already exists' });
    }

    let finalName = (name || '').trim();
    let finalHostel = 'Nandani';
    let finalDepartment = 'General Campus';
    let finalStudentId = '';
    let erpVerified = false;

    // 3. For student signups: MUST auto-fetch from official Campus ERP / pre-approved CSV!
    // No manual entry of hostel or department. No fake names.
    if (role === 'student') {
      const erpResult = await campusErpService.lookupStudent(normEmail);
      if (!erpResult.success || !erpResult.found) {
        return res.status(400).json({
          success: false,
          message:
            erpResult.message ||
            'Student email not found in official campus ERP records. Only enrolled campus students can register.',
        });
      }

      // Enforce official ERP data
      finalName = erpResult.student.name;
      finalHostel = erpResult.student.hostel;
      finalDepartment = erpResult.student.department;
      finalStudentId = erpResult.student.usn;
      finalPhone = erpResult.student.phone || req.body.phone || '+919876543210';
      erpVerified = true;
    } else {
      // For staff roles (collector, admin, recycler)
      finalName = finalName || 'Campus Staff';
      finalPhone = req.body.phone || '+919800000000';
      if (req.body.hostel) {
        finalHostel = req.body.hostel.trim();
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await UserStore.create({
      name: finalName,
      email: normEmail,
      phone: finalPhone,
      password: hashedPassword,
      role: ['student', 'collector', 'admin', 'recycler', 'collection'].includes(role) ? role : 'student',
      hostel: finalHostel,
      department: finalDepartment,
      studentId: finalStudentId,
      erpVerified,
      points: 0,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: erpVerified
        ? `Registration successful! Auto-verified with official Campus ERP (${finalName}, Hostel ${finalHostel}, ${finalDepartment})`
        : 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        hostel: user.hostel,
        department: user.department,
        studentId: user.studentId,
        erpVerified: user.erpVerified,
        points: user.points,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both email and password' });
    }

    const user = await UserStore.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        hostel: user.hostel,
        department: user.department || '',
        studentId: user.studentId || '',
        erpVerified: user.erpVerified || false,
        points: user.points || 0,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserStore.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        institutionName: user.institutionName || 'Nitte Deemed to be University',
        hostel: user.hostel,
        department: user.department || '',
        studentId: user.studentId || '',
        erpVerified: user.erpVerified || false,
        points: user.points || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Send 6-Digit Email Verification OTP
 */
export const sendOtp = async (req, res) => {
  try {
    const { email, purpose = 'registration' } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address is required.' });
    }

    const normEmail = email.toLowerCase().trim();
    const result = await otpService.sendOtp(normEmail, purpose);

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${normEmail}.`,
      expiresInSeconds: result.expiresInSeconds,
      devOtp: result.devOtp, // Visible on screen for frictionless onboarding
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to dispatch verification code' });
  }
};

/**
 * Verify Email OTP and Create New User Account
 * Supports both Student & College / Department / Lab Accounts
 */
export const registerWithOtp = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      otp,
      role = 'student',
      hostel = 'Nandani',
      department = '',
      institutionName = 'Nitte Deemed to be University',
      phone = '',
      studentId = '',
    } = req.body;

    if (!email || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and 6-digit verification code are required.',
      });
    }

    const normEmail = email.toLowerCase().trim();

    // 1. Verify 6-digit OTP
    const verification = otpService.verifyOtp(normEmail, otp);
    if (!verification.valid) {
      return res.status(400).json({ success: false, message: verification.message });
    }

    // 2. Check if user already exists
    const existing = await UserStore.findByEmail(normEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email is already registered.' });
    }

    // 3. Setup role specifics (Student vs College Department vs Staff)
    let finalName = (name || '').trim();
    let finalHostel = hostel || 'Nandani';
    let finalDepartment = department || 'General Studies';
    let finalStudentId = studentId || '';
    let finalPhone = phone || '+919876543210';
    let erpVerified = false;

    if (role === 'college') {
      finalName = finalName || 'Campus Academic Department';
      finalDepartment = finalDepartment || 'Computer Science & Engineering';
      finalHostel = 'Yourspace';
    } else if (role === 'student') {
      // Check if found in official ERP CSV for extra badge
      const erpResult = await campusErpService.lookupStudent(normEmail);
      if (erpResult.success && erpResult.found) {
        finalName = erpResult.student.name || finalName;
        finalHostel = erpResult.student.hostel || finalHostel;
        finalDepartment = erpResult.student.department || finalDepartment;
        finalStudentId = erpResult.student.usn || finalStudentId;
        erpVerified = true;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await UserStore.create({
      name: finalName,
      email: normEmail,
      phone: finalPhone,
      password: hashedPassword,
      role: ['student', 'college', 'institutional', 'collector', 'admin', 'recycler', 'collection'].includes(role)
        ? role
        : 'student',
      institutionName,
      hostel: finalHostel,
      department: finalDepartment,
      studentId: finalStudentId,
      erpVerified,
      isEmailVerified: true,
      points: 0,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: `Account successfully verified and created for ${user.name}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        institutionName: user.institutionName,
        hostel: user.hostel,
        department: user.department,
        studentId: user.studentId,
        erpVerified: user.erpVerified,
        points: user.points,
      },
    });
  } catch (error) {
    console.error('Registration with OTP error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

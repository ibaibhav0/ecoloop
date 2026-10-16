import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_FILE_PATH = path.join(__dirname, '..', 'data', 'campus_students_erp.csv');

// Authorized campus hostels
export const ALLOWED_CAMPUS_HOSTELS = [
  'Nandani',
  'Kaveri',
  'Kumardhara',
  'Saupernikha',
  'Shambhavi',
  'Netravati',
];

// Official Campus Domains
const getCampusDomains = () => {
  const envDomains = process.env.CAMPUS_EMAIL_DOMAINS;
  if (envDomains) {
    return envDomains.split(',').map(d => d.trim().toLowerCase().replace(/^@/, ''));
  }
  return ['ecoloop.campus', 'nitte.edu.in'];
};

class CampusErpService {
  constructor() {
    this.studentsCache = new Map();
    this.lastLoaded = null;
    this.init();
  }

  init() {
    this.loadFromCsvFile();
  }

  isValidCampusDomain(email) {
    if (!email || !email.includes('@')) {
      return {
        valid: false,
        message: 'Invalid email address format.',
      };
    }

    const domain = email.split('@')[1].toLowerCase().trim();
    const allowed = getCampusDomains();

    if (!allowed.includes(domain)) {
      return {
        valid: false,
        domain,
        allowedDomains: allowed,
        message: `Personal or unverified email domain "@${domain}" is not permitted. Please use your official campus email (@${allowed.join(', @')}).`,
      };
    }

    return {
      valid: true,
      domain,
    };
  }

  loadFromCsvFile() {
    try {
      if (!fs.existsSync(CSV_FILE_PATH)) {
        console.warn(`[Campus ERP] CSV file not found at ${CSV_FILE_PATH}`);
        return;
      }

      const content = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
      this.parseAndCacheCsv(content);
      this.lastLoaded = new Date();
      console.log(`[Campus ERP] Loaded ${this.studentsCache.size} verified student records from official CSV`);
    } catch (err) {
      console.error('[Campus ERP] Failed to load student CSV:', err.message);
    }
  }

  parseAndCacheCsv(csvContent) {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return;

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const usnIdx = headers.indexOf('usn');
    const nameIdx = headers.indexOf('name');
    const emailIdx = headers.indexOf('email');
    const phoneIdx = headers.indexOf('phone');
    const hostelIdx = headers.indexOf('hostel');
    const deptIdx = headers.indexOf('department');
    const yearIdx = headers.indexOf('year');
    const statusIdx = headers.indexOf('status');

    if (emailIdx === -1 || nameIdx === -1 || hostelIdx === -1) {
      throw new Error('CSV missing mandatory headers: email, name, hostel');
    }

    const tempMap = new Map();

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length <= emailIdx) continue;

      const email = parts[emailIdx].toLowerCase();
      const hostelRaw = parts[hostelIdx] || 'Nandani';

      // Match hostel case-insensitively to allowed campus hostels
      const matchedHostel = ALLOWED_CAMPUS_HOSTELS.find(
        h => h.toLowerCase() === hostelRaw.toLowerCase()
      ) || 'Nandani';

      const studentRecord = {
        usn: usnIdx !== -1 ? parts[usnIdx] : `CAMPUS-${1000 + i}`,
        name: parts[nameIdx],
        email,
        phone: phoneIdx !== -1 && parts[phoneIdx] ? parts[phoneIdx] : '+919876543210',
        hostel: matchedHostel,
        department: deptIdx !== -1 ? parts[deptIdx] : 'Engineering',
        year: yearIdx !== -1 ? parts[yearIdx] : 'Current',
        status: statusIdx !== -1 ? parts[statusIdx] : 'ACTIVE',
        verifiedByAdmin: true,
        source: 'Official Campus ERP Roster',
      };

      tempMap.set(email, studentRecord);
    }

    this.studentsCache = tempMap;
  }

  async lookupStudent(email) {
    const normEmail = (email || '').toLowerCase().trim();

    // 1. Verify campus domain
    const domainCheck = this.isValidCampusDomain(normEmail);
    if (!domainCheck.valid) {
      return {
        success: false,
        errorType: 'INVALID_DOMAIN',
        message: domainCheck.message,
      };
    }

    // 2. Check if external Campus ERP API is configured
    const erpApiUrl = process.env.CAMPUS_ERP_API_URL;
    if (erpApiUrl) {
      try {
        const apiKey = process.env.CAMPUS_ERP_API_KEY || '';
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${erpApiUrl}?email=${encodeURIComponent(normEmail)}`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json',
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (response.ok) {
          const apiData = await response.json();
          if (apiData && apiData.student) {
            return {
              success: true,
              found: true,
              student: {
                ...apiData.student,
                source: 'Campus Realtime ERP API',
                verifiedByAdmin: true,
              },
            };
          }
        }
      } catch (apiErr) {
        console.warn('[Campus ERP] External ERP API lookup failed, falling back to pre-approved CSV:', apiErr.message);
      }
    }

    // 3. Fallback to Pre-approved Official CSV Roster
    const student = this.studentsCache.get(normEmail);
    if (student) {
      return {
        success: true,
        found: true,
        student,
      };
    }

    return {
      success: false,
      found: false,
      errorType: 'STUDENT_NOT_FOUND',
      message: `No active student record found in official campus ERP for "${normEmail}". Only pre-verified enrolled students can register. Please check your official email or contact the campus administration desk.`,
    };
  }

  getAllStudents() {
    return Array.from(this.studentsCache.values());
  }

  async updateRosterCsv(csvText) {
    try {
      this.parseAndCacheCsv(csvText);
      fs.writeFileSync(CSV_FILE_PATH, csvText, 'utf-8');
      this.lastLoaded = new Date();
      return {
        success: true,
        count: this.studentsCache.size,
        message: `Successfully synchronized ${this.studentsCache.size} student records from updated campus roster.`,
      };
    } catch (err) {
      return {
        success: false,
        message: `Failed to parse or save CSV: ${err.message}`,
      };
    }
  }

  getStatus() {
    return {
      totalStudents: this.studentsCache.size,
      allowedDomains: getCampusDomains(),
      hostels: ALLOWED_CAMPUS_HOSTELS,
      lastLoaded: this.lastLoaded,
      hasExternalApi: Boolean(process.env.CAMPUS_ERP_API_URL),
    };
  }
}

export const campusErpService = new CampusErpService();

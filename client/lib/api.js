const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? 'https://ecoloop-api-campus.vercel.app/api'
    : 'http://localhost:5000/api');

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ecoloop_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async sendOtp(email, purpose = 'registration') {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose }),
    });
    return res.json();
  },

  async registerWithOtp(data) {
    const res = await fetch(`${API_BASE}/auth/register-with-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Items
  async getItems(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.hostel) params.append('hostel', filters.hostel);
    if (filters.type) params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/items?${params.toString()}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getItemById(id) {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async registerItem(data) {
    const res = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async schedulePickup(id, data) {
    const res = await fetch(`${API_BASE}/items/${id}/schedule`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async scanLookup(code) {
    const res = await fetch(`${API_BASE}/items/scan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code }),
    });
    return res.json();
  },

  async collectItem(id, data) {
    const res = await fetch(`${API_BASE}/items/${id}/collect`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async handoverToRecycler(id, data) {
    const res = await fetch(`${API_BASE}/items/${id}/handover`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async recycleItem(id, data) {
    const res = await fetch(`${API_BASE}/items/${id}/recycle`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Analytics & Leaderboard
  async getAnalyticsSummary() {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    return res.json();
  },

  async getLeaderboard() {
    const res = await fetch(`${API_BASE}/analytics/leaderboard`);
    return res.json();
  },

  // Campus ERP Integration
  async lookupErpStudent(email) {
    const res = await fetch(`${API_BASE}/erp/lookup?email=${encodeURIComponent(email)}`);
    return res.json();
  },

  async getErpStatus() {
    const res = await fetch(`${API_BASE}/erp/status`);
    return res.json();
  },

  async getErpStudents() {
    const res = await fetch(`${API_BASE}/erp/students`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async uploadErpCsv(csvText) {
    const res = await fetch(`${API_BASE}/erp/upload-csv`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ csvText }),
    });
    return res.json();
  },

  // Real-Time Notifications (SendGrid Email & Fast2SMS / Twilio SMS)
  async getNotifications(params = {}) {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/notifications?${searchParams.toString()}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return res.json();
  },

  async sendTestNotification(data) {
    const res = await fetch(`${API_BASE}/notifications/test`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // NAAC / NIRF Accreditation Report Generator
  async getNaacReportSummary() {
    const res = await fetch(`${API_BASE}/reports/naac-summary`);
    return res.json();
  },

  getNaacReportPdfUrl() {
    return `${API_BASE}/reports/naac-pdf`;
  },

  // Carbon Credit & Verified Offset Module
  async getCampusCarbonMetrics() {
    const res = await fetch(`${API_BASE}/carbon/campus`);
    return res.json();
  },

  async getMyCarbonCertificate(studentId) {
    const query = studentId ? `?studentId=${encodeURIComponent(studentId)}` : '';
    const res = await fetch(`${API_BASE}/carbon/certificate${query}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getCarbonCertificatePdfUrl(studentId) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('ecoloop_token') : '';
    const params = new URLSearchParams();
    if (token) params.set('token', token);
    if (studentId) params.set('studentId', studentId);
    return `${API_BASE}/carbon/certificate/pdf?${params.toString()}`;
  },

  // Municipalities & NGOs Partnership Portal
  async getCityHotspots(city = '') {
    const query = city ? `?city=${encodeURIComponent(city)}` : '';
    const res = await fetch(`${API_BASE}/partnership/hotspots${query}`);
    return res.json();
  },

  async getAggregatedCampusData() {
    const res = await fetch(`${API_BASE}/partnership/aggregated-data`);
    return res.json();
  },

  async getPartners(params = {}) {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/partnership/partners?${searchParams.toString()}`);
    return res.json();
  },

  async registerPartner(data) {
    const res = await fetch(`${API_BASE}/partnership/partners/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getBulkPickups(params = {}) {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/partnership/bulk-pickups?${searchParams.toString()}`);
    return res.json();
  },

  async createBulkPickup(data) {
    const res = await fetch(`${API_BASE}/partnership/bulk-pickups`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateBulkPickupStatus(id, status, notes = '') {
    const res = await fetch(`${API_BASE}/partnership/bulk-pickups/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    return res.json();
  },

  // Public REST API & Developer Federation
  async getPublicStatsTotal(apiKey = 'ecoloop_live_public_key_2026_demo') {
    const res = await fetch(`${API_BASE}/stats/total`, {
      headers: {
        'X-API-Key': apiKey,
      },
    });
    return res.json();
  },

  async getPublicItems(params = {}, apiKey = 'ecoloop_live_public_key_2026_demo') {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/items?${searchParams.toString()}`, {
      headers: {
        'X-API-Key': apiKey,
      },
    });
    return res.json();
  },

  async registerPublicItem(data, apiKey = 'ecoloop_live_public_key_2026_demo') {
    const res = await fetch(`${API_BASE}/items/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async generateDeveloperKey(data) {
    const res = await fetch(`${API_BASE}/keys/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getSwaggerSpec() {
    const res = await fetch(`${API_BASE}/docs/swagger.json`);
    return res.json();
  },

  // Campus Collection Points & Real CPCB Recycler Map
  async getMapLocations(params = {}) {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/map/locations?${searchParams.toString()}`);
    return res.json();
  },

  async getNearestDropoff(params = {}) {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/map/nearest?${searchParams.toString()}`);
    return res.json();
  },

  // Compliance Alert System & CPCB Audit API
  async getComplianceStatus() {
    const res = await fetch(`${API_BASE}/compliance/status`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async runComplianceAudit() {
    const res = await fetch(`${API_BASE}/compliance/run-audit`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async getComplianceRecyclers() {
    const res = await fetch(`${API_BASE}/compliance/recyclers`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getComplianceOverdueItems() {
    const res = await fetch(`${API_BASE}/compliance/overdue-items`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async resolveOverdueItem(id, notes = '') {
    const res = await fetch(`${API_BASE}/compliance/handover-urgent/${id}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ notes }),
    });
    return res.json();
  },

  // Personal Impact Story & Social Share API
  async getPersonalImpactStory(studentId = '') {
    const query = studentId ? `?studentId=${encodeURIComponent(studentId)}` : '';
    const res = await fetch(`${API_BASE}/carbon/story${query}`, {
      headers: getHeaders(),
    });
    return res.json();
  },
};





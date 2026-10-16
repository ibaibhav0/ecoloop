'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import HandoverRecyclerModal from '@/components/HandoverRecyclerModal';
import StatusTrackerModal from '@/components/StatusTrackerModal';
import QrDisplayModal from '@/components/QrDisplayModal';
import {
  ShieldCheck,
  Building,
  Scale,
  Truck,
  Recycle,
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  ArrowLeft,
  FileText,
  QrCode,
  Users,
  PieChart,
  ArrowUpRight,
  TrendingUp,
  Database,
  Upload,
  GraduationCap,
  AlertCircle,
  FileSpreadsheet,
  Award,
  ShieldAlert,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { formatHostel, formatLocation } from '@/lib/formatHostel';

const HOSTELS = ['all', 'Nandani', 'Kaveri', 'Kumardhara', 'Saupernikha', 'Shambhavi', 'Netravati', 'Yourspace'];

const STATUS_FILTERS = [
  { key: 'all', label: 'ALL ITEMS' },
  { key: 'registered', label: 'REGISTERED' },
  { key: 'scheduled', label: 'SCHEDULED' },
  { key: 'collected', label: 'COLLECTED' },
  { key: 'handed_over', label: 'HANDED OVER' },
  { key: 'verified_recycled', label: 'VERIFIED RECYCLED' },
];

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();

  // Navigation: 'items' | 'erp'
  const [activeSection, setActiveSection] = useState('items');

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hostelFilter, setHostelFilter] = useState('all');

  // Campus ERP State
  const [erpStudents, setErpStudents] = useState([]);
  const [erpStatus, setErpStatus] = useState(null);
  const [erpSearch, setErpSearch] = useState('');
  const [csvUploadText, setCsvUploadText] = useState('');
  const [csvUploadMsg, setCsvUploadMsg] = useState('');
  const [csvUploadLoading, setCsvUploadLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  // Modals
  const [selectedItemForHandover, setSelectedItemForHandover] = useState(null);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [selectedItemIdForTracker, setSelectedItemIdForTracker] = useState(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [selectedItemForQr, setSelectedItemForQr] = useState(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [complianceData, setComplianceData] = useState(null);

  // Fetch Items & Analytics
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, analyticsRes, compRes] = await Promise.all([
        api.getItems(),
        api.getAnalyticsSummary(),
        api.getComplianceStatus().catch(() => ({ success: false })),
      ]);

      if (itemsRes.success && itemsRes.items) {
        setItems(itemsRes.items);
      }
      if (analyticsRes.success && analyticsRes.stats) {
        setStats(analyticsRes.stats);
      }
      if (compRes.success && compRes.data) {
        setComplianceData(compRes.data);
      }
    } catch (e) {
      console.warn('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadErp = useCallback(async () => {
    try {
      const [studentsRes, statusRes] = await Promise.all([
        api.getErpStudents(),
        api.getErpStatus(),
      ]);
      if (studentsRes.success && studentsRes.students) {
        setErpStudents(studentsRes.students);
      }
      if (statusRes.success) {
        setErpStatus(statusRes);
      }
    } catch (e) {
      console.warn('Could not fetch ERP roster:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadErp();
  }, [loadData, loadErp]);

  const handleOpenHandover = (item) => {
    setSelectedItemForHandover(item);
    setIsHandoverOpen(true);
  };

  const handleHandoverSuccess = () => {
    loadData();
  };

  const handleTestLookup = async (e) => {
    e?.preventDefault();
    if (!testEmail.trim()) return;
    setTestLoading(true);
    setTestError('');
    setTestResult(null);
    try {
      const res = await api.lookupErpStudent(testEmail.trim());
      if (res.success && res.student) {
        setTestResult(res.student);
      } else {
        setTestError(res.message || 'STUDENT NOT LOCATED IN ERP ROSTER');
      }
    } catch (err) {
      setTestError(err.message || 'LOOKUP OPERATION FAILED');
    } finally {
      setTestLoading(false);
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvUploadText.trim()) return;
    setCsvUploadLoading(true);
    setCsvUploadMsg('');
    try {
      const res = await api.uploadErpCsv(csvUploadText);
      if (res.success) {
        setCsvUploadMsg(`SUCCESS: ${res.message.toUpperCase()}`);
        setCsvUploadText('');
        loadErp();
      } else {
        setCsvUploadMsg(`ERROR: ${res.message.toUpperCase()}`);
      }
    } catch (err) {
      setCsvUploadMsg(`ERROR: ${err.message.toUpperCase()}`);
    } finally {
      setCsvUploadLoading(false);
    }
  };

  const handleCsvFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvUploadText(event.target.result);
    };
    reader.readAsText(file);
  };

  // Filtered items
  const filteredItems = items.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (hostelFilter !== 'all' && item.userHostel !== hostelFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        item.trackingCode.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.userName?.toLowerCase().includes(q) ||
        item.userHostel?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Filtered ERP students
  const filteredErpStudents = erpStudents.filter((s) => {
    if (!erpSearch.trim()) return true;
    const q = erpSearch.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.usn?.toLowerCase().includes(q) ||
      s.hostel?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q)
    );
  });

  // Analytics Helpers
  const totalKg = stats?.totalKg || items.reduce((acc, curr) => acc + (curr.actualWeight || curr.approxWeight || 0), 0);
  const collectedKg = stats?.collectedKg || items.filter(i => ['collected', 'handed_over', 'verified_recycled'].includes(i.status)).reduce((acc, curr) => acc + (curr.actualWeight || curr.approxWeight || 0), 0);
  const totalItemsCount = items.length;

  // Hostel item counts & participation estimates
  const hostelDataMap = {};
  HOSTELS.filter(h => h !== 'all').forEach(h => {
    hostelDataMap[h] = { hostel: h, itemsCount: 0, totalKg: 0, studentsSet: new Set() };
  });

  items.forEach(item => {
    const h = item.userHostel || 'Nandani';
    if (!hostelDataMap[h]) {
      hostelDataMap[h] = { hostel: h, itemsCount: 0, totalKg: 0, studentsSet: new Set() };
    }
    hostelDataMap[h].itemsCount += 1;
    hostelDataMap[h].totalKg += (item.actualWeight || item.approxWeight || 0);
    if (item.userName) {
      hostelDataMap[h].studentsSet.add(item.userName);
    }
  });

  const hostelAnalyticsList = Object.values(hostelDataMap).map(d => ({
    hostel: d.hostel,
    itemsCount: d.itemsCount,
    totalKg: Number(d.totalKg.toFixed(1)),
    activeStudents: d.studentsSet.size,
    participationRate: Math.min(100, Math.round((d.studentsSet.size / 5) * 100)),
  })).sort((a, b) => b.itemsCount - a.itemsCount);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'registered':
        return { label: 'REGISTERED', icon: Clock };
      case 'scheduled':
        return { label: 'SCHEDULED', icon: Calendar };
      case 'collected':
        return { label: 'COLLECTED', icon: Scale };
      case 'handed_over':
        return { label: 'HANDED OVER', icon: Truck };
      case 'verified_recycled':
        return { label: 'VERIFIED RECYCLED', icon: Recycle };
      default:
        return { label: (status || 'UNKNOWN').toUpperCase(), icon: CheckCircle2 };
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#f0f0fa] flex flex-col font-['D-DIN',Arial,sans-serif]">
      {/* Top Aerospace Telemetry Status */}
      <div className="bg-[#0a0a0a] border-b border-[#3a3a3f] py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#ffffff] animate-pulse" />
            <span className="spacex-caption">OPERATOR TELEMETRY:</span>
            <span className="font-mono text-xs text-[#ffffff] uppercase tracking-wider">
              {user?.name || 'MANAN SEHGAL'} // ROLE: {user?.role || 'ADMIN'} // SECTOR: {user?.hostel || 'SAUPERNIKHA'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {logout && (
              <button
                onClick={logout}
                className="btn-spacex !py-1 !px-3 !text-[11px]"
              >
                <LogOut className="w-3 h-3" />
                <span>SIGN OUT</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="bg-[#000000] border-b border-[#3a3a3f] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <button
            onClick={() => (window.history.length > 1 ? window.history.back() : (window.location.href = '/'))}
            className="flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="w-10 h-10 border border-[#ffffff] flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="spacex-header text-xl tracking-[2px] block">
                ECOLOOP
              </span>
              <span className="spacex-caption text-[11px] block text-[#5a5a5f]">
                CAMPUS ADMINISTRATION SYSTEM
              </span>
            </div>
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/report"
              className="btn-spacex !text-xs !py-2 !px-4"
            >
              <Award className="w-3.5 h-3.5" /> NAAC / NIRF REPORT
            </Link>
            <Link
              href="/recycler"
              className="btn-spacex !text-xs !py-2 !px-4"
            >
              <Recycle className="w-3.5 h-3.5" /> RECYCLER PORTAL
            </Link>
            <Link
              href="/scan"
              className="btn-spacex !text-xs !py-2 !px-4"
            >
              <QrCode className="w-3.5 h-3.5" /> SCANNER
            </Link>
            <button
              onClick={() => (window.history.length > 1 ? window.history.back() : (window.location.href = '/'))}
              className="btn-spacex !text-xs !py-2 !px-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> BACK
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Austere Mission Banner */}
        <div className="bg-[#0a0a0a] border border-[#3a3a3f] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="spacex-caption text-[#5a5a5f] flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>COMMAND &amp; STATUTORY ERP CONSOLE // MANAN SEHGAL</span>
            </div>
            <h1 className="spacex-header text-2xl sm:text-4xl text-white">
              ADMIN OPERATIONS &amp; ERP CENTER
            </h1>
            <p className="text-sm text-[#5a5a5f] max-w-2xl leading-relaxed">
              SUPERVISE PHYSICAL E-WASTE CUSTODY CHAINS, INSPECT OFFICIAL UNIVERSITY ERP ROSTERS, PREVENT UNVERIFIED SUBMISSIONS, AND EXECUTE CERTIFIED HANDOVERS TO LICENSED RECYCLER JANAVI BAIROLIYA.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="bg-[#000000] border border-[#3a3a3f] p-5 text-center min-w-[140px]">
              <span className="spacex-caption block">TOTAL MANIFEST</span>
              <span className="spacex-header text-3xl text-white block mt-1">{totalItemsCount}</span>
            </div>
            <div className="bg-[#000000] border border-[#3a3a3f] p-5 text-center min-w-[140px]">
              <span className="spacex-caption block">VERIFIED MASS</span>
              <span className="spacex-header text-3xl text-white block mt-1">{collectedKg} KG</span>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-3 border-b border-[#3a3a3f] pb-4 flex-wrap">
          <button
            onClick={() => setActiveSection('items')}
            className={`btn-spacex !text-xs ${
              activeSection === 'items'
                ? '!bg-[#ffffff] !text-[#000000]'
                : ''
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>MANIFEST &amp; RECYCLER HANDOVERS ({filteredItems.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('erp')}
            className={`btn-spacex !text-xs ${
              activeSection === 'erp'
                ? '!bg-[#ffffff] !text-[#000000]'
                : ''
            }`}
          >
            <Database className="w-4 h-4" />
            <span>CAMPUS ERP ROSTER ({erpStudents.length})</span>
          </button>

          <Link
            href="/report"
            className="btn-spacex !text-xs"
          >
            <Award className="w-4 h-4" />
            <span>NAAC CRITERIA 7 REPORT (PDF)</span>
          </Link>

          <Link
            href="/compliance"
            className="btn-spacex !text-xs"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>STATUTORY COMPLIANCE AUDIT</span>
            {(complianceData?.totalCriticalBreaches || 0) > 0 && (
              <span className="ml-1 px-2 py-0.2 bg-[#ffffff] text-[#000000] text-[10px] font-bold">
                {complianceData.totalCriticalBreaches} BREACHES
              </span>
            )}
          </Link>
        </div>

        {/* Statutory Compliance Notice (if any) */}
        {complianceData?.totalCriticalBreaches > 0 && (
          <div className="bg-[#0a0a0a] border border-[#ffffff] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="border border-[#ffffff] p-2 shrink-0">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1">
                <div className="spacex-caption text-[#ffffff]">
                  CRITICAL STATUTORY NOTICE // E-WASTE (MANAGEMENT) RULES 2022
                </div>
                <h3 className="spacex-header text-base text-white">
                  {complianceData.itemAudit?.criticalBreachesCount || 0} ITEM HANDOVER SLA BREACH(ES) &amp; {complianceData.recyclerAudit?.expiredCount || 0} RECYCLER AUTHORIZATION BREACH(ES)
                </h3>
                <p className="text-xs text-[#5a5a5f] max-w-2xl leading-relaxed">
                  Consignments stored beyond statutory 30-day thresholds must be transferred immediately to CPCB-authorized recycler Janavi Bairoliya (CleanGreen Recovery). Handovers to uncertified facilities are strictly prohibited.
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <Link
                href="/compliance"
                className="btn-spacex !text-xs !bg-[#ffffff] !text-[#000000]"
              >
                <span>AUDIT STATUTORY LOG</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* ======================= SECTION 1: ITEMS & RECYCLER HANDOVERS ======================= */}
        {activeSection === 'items' && (
          <div className="space-y-8">
            {/* Telemetry Charts (Austere Monochrome) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Telemetry 1: Mass Diversion */}
              <div className="bg-[#0a0a0a] border border-[#3a3a3f] p-6 flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="spacex-header text-sm text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-white" /> MASS DIVERSION
                  </h3>
                  <span className="font-mono text-xs text-white">
                    {totalKg} KG TOTAL
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="spacex-caption">COLLECTION RATIO</span>
                    <span className="font-mono text-white font-bold">
                      {totalKg > 0 ? Math.round((collectedKg / totalKg) * 100) : 0}%
                    </span>
                  </div>
                  {/* SpaceX Monochrome Progress Bar */}
                  <div className="h-2 w-full bg-[#000000] border border-[#3a3a3f]">
                    <div
                      className="h-full bg-[#ffffff] transition-all duration-500"
                      style={{ width: `${totalKg > 0 ? Math.min(100, Math.round((collectedKg / totalKg) * 100)) : 0}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-[#000000] border border-[#3a3a3f] text-center">
                      <span className="spacex-caption block text-[10px]">VERIFIED SCALE</span>
                      <span className="spacex-header text-lg text-white block mt-1">{collectedKg} KG</span>
                    </div>
                    <div className="p-3 bg-[#000000] border border-[#3a3a3f] text-center">
                      <span className="spacex-caption block text-[10px]">PENDING CUSTODY</span>
                      <span className="spacex-header text-lg text-white block mt-1">
                        {Number(Math.max(0, totalKg - collectedKg).toFixed(1))} KG
                      </span>
                    </div>
                  </div>
                </div>

                <p className="spacex-caption text-[11px] text-[#5a5a5f]">
                  CALIBRATED BY DIGITAL SCALE SENSORS // NO ESTIMATED OVERRIDES
                </p>
              </div>

              {/* Telemetry 2: Distribution by Sector */}
              <div className="bg-[#0a0a0a] border border-[#3a3a3f] p-6 flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="spacex-header text-sm text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-white" /> SECTOR MASS PROFILE
                  </h3>
                  <span className="spacex-caption text-[11px]">CAMPUS RESIDENTIAL</span>
                </div>

                <div className="space-y-3">
                  {hostelAnalyticsList.slice(0, 5).map((h) => {
                    const maxItems = Math.max(...hostelAnalyticsList.map((x) => x.itemsCount), 0);
                    const pct = maxItems > 0 && h.itemsCount > 0 ? Math.round((h.itemsCount / maxItems) * 100) : 0;
                    return (
                      <div key={h.hostel} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-mono uppercase text-[#ffffff]">{h.hostel}</span>
                          <span className="font-mono text-[#5a5a5f]">
                            {h.itemsCount} UNITS // {h.totalKg} KG
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-[#000000] border border-[#3a3a3f]">
                          <div
                            className="h-full bg-[#ffffff] transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="spacex-caption text-[11px] text-[#5a5a5f]">
                  DYNAMIC METRICS TRANSMITTED UPON DIGITAL WEIGH-IN
                </p>
              </div>

              {/* Telemetry 3: Participation Rate */}
              <div className="bg-[#0a0a0a] border border-[#3a3a3f] p-6 flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="spacex-header text-sm text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-white" /> SECTOR PARTICIPATION
                  </h3>
                  <span className="spacex-caption text-[11px]">ACTIVE OPERATORS</span>
                </div>

                <div className="space-y-3">
                  {hostelAnalyticsList.slice(0, 4).map((h) => (
                    <div key={h.hostel} className="flex items-center justify-between text-xs border-b border-[#3a3a3f] pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#ffffff]" />
                        <span className="font-mono uppercase text-[#ffffff]">{h.hostel}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[#5a5a5f] text-[11px]">{h.activeStudents} OPERATORS</span>
                        <span className="font-mono text-[#ffffff] font-bold w-12 text-right">
                          {h.participationRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-[#000000] border border-[#3a3a3f] text-xs font-mono text-[#5a5a5f]">
                  {hostelAnalyticsList.some((h) => h.itemsCount > 0)
                    ? `LEAD SECTOR: ${hostelAnalyticsList[0].hostel.toUpperCase()} WITH ${hostelAnalyticsList[0].itemsCount} UNITS (${hostelAnalyticsList[0].totalKg} KG).`
                    : 'NO ITEMS DISPATCHED. TELEMETRY SYNCS IN REAL TIME.'}
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-[#0a0a0a] border border-[#3a3a3f] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#5a5a5f] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="SEARCH CODE, OPERATOR, CATEGORY..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs bg-[#000000] border border-[#3a3a3f] text-[#ffffff] uppercase font-mono w-64 focus:border-[#ffffff]"
                  />
                </div>

                <select
                  value={hostelFilter}
                  onChange={(e) => setHostelFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-[#000000] border border-[#3a3a3f] text-[#ffffff] uppercase font-mono"
                >
                  {HOSTELS.map((h) => (
                    <option key={h} value={h}>
                      {h === 'all' ? 'ALL SECTORS' : h.toUpperCase()}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-[#000000] border border-[#3a3a3f] text-[#ffffff] uppercase font-mono"
                >
                  {STATUS_FILTERS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="spacex-caption text-[#5a5a5f]">
                MANIFEST COUNT: <strong className="text-white">{filteredItems.length}</strong> ENTRIES
              </div>
            </div>

            {/* Manifest Table */}
            <div className="border border-[#3a3a3f] overflow-x-auto bg-[#000000]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#3a3a3f] bg-[#0a0a0a]">
                    <th className="py-3 px-4 spacex-caption">ITEM / TRACKING CODE</th>
                    <th className="py-3 px-4 spacex-caption">DEPOSITOR &amp; SECTOR</th>
                    <th className="py-3 px-4 spacex-caption">MASS (KG)</th>
                    <th className="py-3 px-4 spacex-caption">CUSTODY STATUS</th>
                    <th className="py-3 px-4 spacex-caption">LOGISTICS NODE</th>
                    <th className="py-3 px-4 spacex-caption text-right">DISPATCH CONTROLS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3a3a3f]">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#5a5a5f] font-mono uppercase">
                        NO CONSIGNMENTS MATCH SELECTED FILTERS.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const statusInfo = getStatusBadge(item.status);
                      const StatusIcon = statusInfo.icon;

                      return (
                        <tr key={item._id || item.trackingCode} className="hover:bg-[#0a0a0a] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {item.photoUrl ? (
                                <div className="w-10 h-10 border border-[#3a3a3f] bg-[#0a0a0a] shrink-0 overflow-hidden">
                                  <img src={item.photoUrl} alt="Item" className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 border border-[#3a3a3f] bg-[#0a0a0a] flex items-center justify-center text-[#5a5a5f] shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                              )}
                              <div>
                                <span className="font-mono text-xs text-white block">
                                  {item.trackingCode}
                                </span>
                                <span className="text-[11px] uppercase text-[#5a5a5f] block">
                                  {item.type}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-mono text-white text-xs uppercase">{item.userName || 'STUDENT'}</p>
                            <p className="spacex-caption text-[11px] text-[#5a5a5f]">{formatHostel(item.userHostel)}</p>
                          </td>

                          <td className="py-3.5 px-4 font-mono">
                            {item.actualWeight ? (
                              <div>
                                <span className="text-white font-bold">{item.actualWeight} KG</span>
                                <span className="text-[10px] text-[#5a5a5f] block">CALIBRATED</span>
                              </div>
                            ) : (
                              <div>
                                <span className="text-[#5a5a5f]">{item.approxWeight} KG</span>
                                <span className="text-[10px] text-[#5a5a5f] block">DECLARED</span>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#3a3a3f] bg-[#0a0a0a] text-white font-mono text-[10px] uppercase">
                              <StatusIcon className="w-3 h-3 text-white" />
                              {statusInfo.label}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-mono text-white text-xs truncate max-w-[180px] uppercase">
                              {formatLocation(item.location, item.userHostel)}
                            </p>
                            {item.pickupDate && (
                              <p className="spacex-caption text-[10px] text-[#5a5a5f] truncate max-w-[180px]">
                                {item.pickupDate}
                              </p>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {item.status === 'collected' ? (
                                <button
                                  onClick={() => handleOpenHandover(item)}
                                  className="btn-spacex !text-xs !py-1 !px-3"
                                  title="Mark item as dispatched to Authorised Recycler Janavi Bairoliya"
                                >
                                  <Truck className="w-3 h-3" /> HANDOVER
                                </button>
                              ) : item.status === 'handed_over' ? (
                                <span className="px-2 py-1 border border-[#3a3a3f] text-[#5a5a5f] font-mono text-[10px] uppercase">
                                  DISPATCHED
                                </span>
                              ) : item.status === 'verified_recycled' ? (
                                <span className="px-2 py-1 border border-[#ffffff] text-[#ffffff] font-mono text-[10px] uppercase">
                                  CERTIFIED RECYCLED
                                </span>
                              ) : (
                                <span className="spacex-caption text-[11px] text-[#5a5a5f]">
                                  AWAITING SCALE
                                </span>
                              )}

                              <button
                                onClick={() => {
                                  setSelectedItemForQr(item);
                                  setIsQrOpen(true);
                                }}
                                title="View QR Code sticker"
                                className="p-1.5 border border-[#3a3a3f] text-white hover:bg-[#ffffff] hover:text-[#000000] transition-colors"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedItemIdForTracker(item._id || item.id);
                                  setIsTrackerOpen(true);
                                }}
                                title="View Digital Handover History"
                                className="p-1.5 border border-[#3a3a3f] text-white hover:bg-[#ffffff] hover:text-[#000000] transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================= SECTION 2: CAMPUS ERP & STUDENT DATABASE ======================= */}
        {activeSection === 'erp' && (
          <div className="space-y-8">
            {/* Status Telemetry Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0a0a0a] border border-[#3a3a3f] p-5">
                <span className="spacex-caption block">OFFICIAL ERP ROSTER</span>
                <p className="spacex-header text-3xl text-white mt-1">{erpStudents.length}</p>
                <span className="spacex-caption text-[11px] text-[#5a5a5f] block mt-1">
                  VERIFIED ENROLLED PROFILES
                </span>
              </div>

              <div className="bg-[#0a0a0a] border border-[#3a3a3f] p-5">
                <span className="spacex-caption block">AUTHORIZED DOMAINS</span>
                <p className="font-mono text-xs text-white mt-2">
                  @ecoloop.campus, @nmamit.in
                </p>
                <span className="spacex-caption text-[11px] text-[#5a5a5f] block mt-1">
                  UNAUTHORIZED DOMAINS REJECTED
                </span>
              </div>

              <div className="bg-[#0a0a0a] border border-[#3a3a3f] p-5">
                <span className="spacex-caption block">CAMPUS SECTORS</span>
                <p className="spacex-header text-3xl text-white mt-1">6 RESIDENCES</p>
                <span className="spacex-caption text-[11px] text-[#5a5a5f] block mt-1 truncate">
                  NANDANI, KAVERI, KUMARDHARA...
                </span>
              </div>

              <div className="bg-[#0a0a0a] border border-[#3a3a3f] p-5">
                <span className="spacex-caption block">AUTHENTICATION SOURCE</span>
                <p className="font-mono text-xs text-white mt-2 truncate">
                  campus_students_erp.csv
                </p>
                <span className="spacex-caption text-[11px] text-[#5a5a5f] block mt-1">
                  OFFICIAL INSTITUTIONAL SYNC
                </span>
              </div>
            </div>

            {/* LIVE ERP LOOKUP TEST WIDGET & CSV UPLOADER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Box 1: ERP Auto-fetch Tester */}
              <div className="bg-[#0a0a0a] border border-[#3a3a3f] p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 border border-[#3a3a3f]">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="spacex-header text-sm text-white">CAMPUS ERP AUTO-FETCH TEST TERMINAL</h3>
                    <p className="spacex-caption text-[11px] text-[#5a5a5f]">TEST STUDENT CREDENTIAL SYNC UPON REGISTRATION</p>
                  </div>
                </div>

                <form onSubmit={handleTestLookup} className="flex gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="E.G. BAIBHAV@ECOLOOP.CAMPUS"
                    className="flex-1 px-3 py-2 text-xs border border-[#3a3a3f] bg-[#000000] text-white font-mono uppercase"
                  />
                  <button
                    type="submit"
                    disabled={testLoading || !testEmail.trim()}
                    className="btn-spacex !text-xs !py-2 !px-4"
                  >
                    {testLoading ? 'QUERYING...' : 'QUERY ERP'}
                  </button>
                </form>

                {testError && (
                  <div className="p-3 bg-[#000000] border border-[#ffffff] text-xs font-mono uppercase text-white flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-white" />
                    <span>{testError}</span>
                  </div>
                )}

                {testResult && (
                  <div className="p-4 bg-[#000000] border border-[#3a3a3f] space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="spacex-header text-sm text-white">{testResult.name}</span>
                      <span className="px-2 py-0.5 border border-[#3a3a3f] text-white">
                        {testResult.usn}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#3a3a3f]">
                      <div>
                        <span className="spacex-caption block text-[10px]">ASSIGNED SECTOR:</span>
                        <strong className="text-white uppercase">{testResult.hostel}</strong>
                      </div>
                      <div>
                        <span className="spacex-caption block text-[10px]">DEPARTMENT:</span>
                        <strong className="text-white uppercase">{testResult.department}</strong>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 text-xs font-mono text-[#5a5a5f]">
                  <span className="spacex-caption block mb-1">SAMPLE OPERATOR LOOKUPS:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTestEmail('baibhav@ecoloop.campus');
                      api.lookupErpStudent('baibhav@ecoloop.campus').then(r => setTestResult(r.student));
                    }}
                    className="text-white hover:underline mr-3 uppercase"
                  >
                    [ Baibhav Kumar ]
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTestEmail('ananya@ecoloop.campus');
                      api.lookupErpStudent('ananya@ecoloop.campus').then(r => setTestResult(r.student));
                    }}
                    className="text-white hover:underline mr-3 uppercase"
                  >
                    [ Ananya Iyer ]
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTestEmail('rohit@ecoloop.campus');
                      api.lookupErpStudent('rohit@ecoloop.campus').then(r => setTestResult(r.student));
                    }}
                    className="text-white hover:underline uppercase"
                  >
                    [ Rohit Shetty ]
                  </button>
                </div>
              </div>

              {/* Box 2: Pre-Approved CSV Upload & Synchronizer */}
              <div className="bg-[#0a0a0a] border border-[#3a3a3f] p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 border border-[#3a3a3f]">
                    <FileSpreadsheet className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="spacex-header text-sm text-white">INSTITUTIONAL ROSTER INGESTION</h3>
                    <p className="spacex-caption text-[11px] text-[#5a5a5f]">REFRESH OFFICIAL UNIVERSITY VERIFIED DATABASE</p>
                  </div>
                </div>

                <form onSubmit={handleCsvUpload} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="btn-spacex !text-xs !py-1.5 !px-3 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" /> SELECT CSV FILE
                      <input type="file" accept=".csv" onChange={handleCsvFileUpload} className="hidden" />
                    </label>
                    <span className="spacex-caption text-[11px] text-[#5a5a5f]">OR INPUT CSV PAYLOAD DIRECTLY</span>
                  </div>

                  <textarea
                    rows={3}
                    value={csvUploadText}
                    onChange={(e) => setCsvUploadText(e.target.value)}
                    placeholder="usn,name,email,hostel,department,year,status"
                    className="w-full p-2.5 text-xs font-mono border border-[#3a3a3f] bg-[#000000] text-white focus:border-[#ffffff]"
                  />

                  {csvUploadMsg && (
                    <p className="text-xs font-mono text-white">
                      {csvUploadMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={csvUploadLoading || !csvUploadText.trim()}
                    className="btn-spacex !text-xs !py-2 !px-4"
                  >
                    {csvUploadLoading ? 'SYNCHRONIZING...' : 'EXECUTE ROSTER SYNC'}
                  </button>
                </form>
              </div>
            </div>

            {/* Official Student Database Table */}
            <div className="border border-[#3a3a3f] bg-[#000000]">
              <div className="p-4 bg-[#0a0a0a] border-b border-[#3a3a3f] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="spacex-header text-sm text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-white" /> OFFICIAL CAMPUS ERP STUDENT DIRECTORY
                  </h3>
                  <p className="spacex-caption text-[11px] text-[#5a5a5f]">
                    SOURCE: VERIFIED UNIVERSITY ACADEMIC DATABASE // MIGRATION ENFORCED
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-[#5a5a5f] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="SEARCH ROSTER..."
                    value={erpSearch}
                    onChange={(e) => setErpSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs bg-[#000000] border border-[#3a3a3f] text-white uppercase font-mono w-64 focus:border-[#ffffff]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#3a3a3f] bg-[#0a0a0a]">
                      <th className="py-3 px-4 spacex-caption">USN / IDENTIFIER</th>
                      <th className="py-3 px-4 spacex-caption">STUDENT NAME</th>
                      <th className="py-3 px-4 spacex-caption">INSTITUTIONAL EMAIL</th>
                      <th className="py-3 px-4 spacex-caption">VERIFIED SECTOR</th>
                      <th className="py-3 px-4 spacex-caption">DEPARTMENT</th>
                      <th className="py-3 px-4 spacex-caption">YEAR</th>
                      <th className="py-3 px-4 spacex-caption">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3a3a3f]">
                    {filteredErpStudents.map((s) => (
                      <tr key={s.email} className="hover:bg-[#0a0a0a] transition-colors">
                        <td className="py-3 px-4 font-mono text-white">{s.usn}</td>
                        <td className="py-3 px-4 font-mono uppercase text-white">{s.name}</td>
                        <td className="py-3 px-4 font-mono text-[#5a5a5f]">{s.email}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs uppercase text-white">
                            {s.hostel}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono uppercase text-[#5a5a5f]">{s.department}</td>
                        <td className="py-3 px-4 font-mono text-[#5a5a5f]">{s.year}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 border border-[#3a3a3f] font-mono text-[10px] text-white uppercase">
                            {s.status || 'ACTIVE'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <HandoverRecyclerModal
        item={selectedItemForHandover}
        isOpen={isHandoverOpen}
        onClose={() => setIsHandoverOpen(false)}
        onSuccess={handleHandoverSuccess}
      />

      <StatusTrackerModal
        itemId={selectedItemIdForTracker}
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
      />

      <QrDisplayModal
        item={selectedItemForQr}
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
      />
    </div>
  );
}

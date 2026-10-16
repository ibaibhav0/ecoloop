'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Building2,
  Handshake,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Truck,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  Scale,
  Sparkles,
  Info,
  Filter,
  Eye,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';

export default function PartnershipPortalPage() {
  const [activeTab, setActiveTab] = useState('hotspots'); // 'hotspots', 'aggregated', 'drives', 'directory'
  const [selectedCity, setSelectedCity] = useState('All');
  const [hotspotsData, setHotspotsData] = useState(null);
  const [aggregatedData, setAggregatedData] = useState(null);
  const [partners, setPartners] = useState([]);
  const [bulkPickups, setBulkPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  // Modals
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // New Bulk Pickup Form State
  const [pickupForm, setPickupForm] = useState({
    partnerName: 'Mangaluru City Corporation (MCC)',
    partnerType: 'municipality',
    city: 'Mangaluru',
    locationName: 'Lalbagh Municipal Town Hall',
    driveTitle: 'Mangaluru Coastal Clean E-Waste Drive 2026',
    approxWeightKg: 75,
    estimatedItemCount: 120,
    categoryTypes: ['Laptop / Computer', 'Mobile Phone / Tablet', 'Home Appliance'],
    proposedDate: '2026-10-28',
    contactPhone: '+91-824-2220306',
    pickupAddress: 'Town Hall Premises, MG Road, Mangaluru, Karnataka - 575003',
    notes: 'Joint community collection camp organized with local resident welfare associations.',
  });

  // Partner Registration Form State
  const [partnerForm, setPartnerForm] = useState({
    orgName: '',
    orgType: 'ngo',
    registrationNumber: '',
    city: 'Mangaluru',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    officialAddress: '',
    website: '',
    establishedYear: 2018,
  });

  const [formSuccessMessage, setFormSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [hRes, aRes, pRes, bRes] = await Promise.all([
        api.getCityHotspots(selectedCity === 'All' ? '' : selectedCity),
        api.getAggregatedCampusData(),
        api.getPartners(),
        api.getBulkPickups(),
      ]);

      if (hRes.success) {
        setHotspotsData(hRes);
        if (hRes.hotspots && hRes.hotspots.length > 0 && !selectedHotspot) {
          setSelectedHotspot(hRes.hotspots[0]);
        }
      }
      if (aRes.success) setAggregatedData(aRes);
      if (pRes.success) setPartners(pRes.partners || []);
      if (bRes.success) setBulkPickups(bRes.bulkPickups || []);
    } catch (err) {
      console.warn('Error loading partnership data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [selectedCity]);

  const handleCreatePickup = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.createBulkPickup(pickupForm);
      if (res.success) {
        setFormSuccessMessage(`SUCCESS: BULK DISPATCH REGISTERED // REF CODE: ${res.bulkPickup.referenceCode}`);
        setIsPickupModalOpen(false);
        await loadAllData();
        setTimeout(() => setFormSuccessMessage(''), 5000);
      }
    } catch (err) {
      alert(err.message || 'Error submitting pickup request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterPartner = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.registerPartner(partnerForm);
      if (res.success) {
        setFormSuccessMessage(`SUCCESS: ENTITY [${res.partner.orgName.toUpperCase()}] REGISTERED`);
        setIsRegisterModalOpen(false);
        await loadAllData();
        setTimeout(() => setFormSuccessMessage(''), 5000);
      }
    } catch (err) {
      alert(err.message || 'Error registering organization');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await api.updateBulkPickupStatus(id, status);
      if (res.success) {
        await loadAllData();
      }
    } catch (err) {
      console.warn('Status update error:', err);
    }
  };

  const hotspots = hotspotsData?.hotspots || [];

  return (
    <div className="min-h-screen bg-[#000000] text-[#f0f0fa] flex flex-col font-sans selection:bg-[#ffffff] selection:text-[#000000]">
      {/* Top Telemetry Header */}
      <header className="bg-[#000000] border-b border-[#3a3a3f] py-4 px-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.history.length > 1) {
                  window.history.back();
                } else {
                  window.location.href = '/';
                }
              }}
              className="inline-flex items-center gap-2 text-[12px] uppercase tracking-wider font-bold text-[#ffffff] border border-[#3a3a3f] hover:border-[#ffffff] px-4 py-2 rounded-full transition-all cursor-pointer bg-transparent"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              BACK
            </button>
            <div className="h-4 w-px bg-[#3a3a3f] hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ffffff] animate-ping" />
              <h1 className="text-sm font-bold tracking-widest text-[#ffffff] uppercase font-mono">
                MUNICIPALITIES & NGOS PARTNERSHIP PORTAL
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-4 py-2 rounded-full text-[12px] uppercase tracking-wider font-bold text-[#ffffff] border border-[#3a3a3f] hover:border-[#ffffff] hover:bg-[#ffffff] hover:text-[#000000] inline-flex items-center gap-2 transition-all cursor-pointer bg-transparent"
            >
              <Building2 className="w-3.5 h-3.5" />
              REGISTER ENTITY
            </button>
            <button
              onClick={() => setIsPickupModalOpen(true)}
              className="px-5 py-2 rounded-full text-[12px] uppercase tracking-wider font-bold text-[#000000] bg-[#ffffff] hover:bg-transparent hover:text-[#ffffff] border border-[#ffffff] inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              REQUEST BULK PICKUP
            </button>
          </div>
        </div>
      </header>

      {/* Hero Telemetry Dossier */}
      <div className="bg-[#0a0a0a] border-b border-[#3a3a3f] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#3a3a3f] text-[#5a5a5f] text-[11px] font-mono uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-[#ffffff]" />
              CIVIC COLLABORATION // OFFICIAL CPCB INVENTORY
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#ffffff] uppercase font-mono">
              MUNICIPAL CORPORATION & NGO CIRCULAR NETWORK
            </h2>
            <p className="text-sm text-[#f0f0fa] leading-relaxed">
              Enabling civic authorities including <strong>Mangaluru City Corporation (MCC)</strong>, <strong>CMC Udupi</strong>, and <strong>BBMP</strong>, alongside certified NGOs (Saahas Zero Waste, Hasiru Dala), to access verified campus telemetry, coordinate bulk community drives, and target urban e-waste concentrations.
            </p>
          </div>

          {/* Quick Metrics Telemetry */}
          <div className="border border-[#3a3a3f] bg-[#000000] p-6 flex items-center gap-8 shrink-0">
            <div>
              <div className="text-[11px] uppercase font-mono tracking-widest text-[#5a5a5f]">HOTSPOTS AUDITED</div>
              <div className="text-3xl font-mono font-bold text-[#ffffff] mt-1">{hotspotsData?.totalHotspots || 0}</div>
              <div className="text-[10px] uppercase font-mono text-[#5a5a5f] mt-1">CPCB / KSPCB VERIFIED</div>
            </div>
            <div className="h-10 w-px bg-[#3a3a3f]" />
            <div>
              <div className="text-[11px] uppercase font-mono tracking-widest text-[#5a5a5f]">BULK CAMPAIGNS</div>
              <div className="text-3xl font-mono font-bold text-[#ffffff] mt-1">{bulkPickups.length}</div>
              <div className="text-[10px] uppercase font-mono text-[#5a5a5f] mt-1">ACTIVE / LOGGED</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {formSuccessMessage && (
        <div className="max-w-7xl mx-auto w-full px-6 pt-6">
          <div className="p-4 bg-[#0a0a0a] border border-[#ffffff] text-[#ffffff] flex items-center gap-3 text-xs font-mono tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-[#ffffff] shrink-0" />
            <span>{formSuccessMessage}</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-6">
        <div className="flex border-b border-[#3a3a3f] gap-4 sm:gap-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('hotspots')}
            className={`pb-4 text-[12px] font-mono uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'hotspots'
                ? 'border-[#ffffff] text-[#ffffff] font-bold'
                : 'border-transparent text-[#5a5a5f] hover:text-[#f0f0fa]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            HOTSPOTS MAP (CPCB)
          </button>

          <button
            onClick={() => setActiveTab('aggregated')}
            className={`pb-4 text-[12px] font-mono uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'aggregated'
                ? 'border-[#ffffff] text-[#ffffff] font-bold'
                : 'border-transparent text-[#5a5a5f] hover:text-[#f0f0fa]'
            }`}
          >
            <Layers className="w-4 h-4" />
            AGGREGATED CAMPUS DATA
          </button>

          <button
            onClick={() => setActiveTab('drives')}
            className={`pb-4 text-[12px] font-mono uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'drives'
                ? 'border-[#ffffff] text-[#ffffff] font-bold'
                : 'border-transparent text-[#5a5a5f] hover:text-[#f0f0fa]'
            }`}
          >
            <Truck className="w-4 h-4" />
            COMMUNITY BULK DRIVES ({bulkPickups.length})
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`pb-4 text-[12px] font-mono uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'directory'
                ? 'border-[#ffffff] text-[#ffffff] font-bold'
                : 'border-transparent text-[#5a5a5f] hover:text-[#f0f0fa]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            PARTNERS DIRECTORY ({partners.length})
          </button>
        </div>
      </div>

      {/* Main Container Content */}
      <main className="max-w-7xl mx-auto w-full px-6 py-6 flex-1 space-y-8">
        {/* TAB 1: Real City E-Waste Hotspots Interactive Map & CPCB Data */}
        {activeTab === 'hotspots' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a0a0a] p-4 border border-[#3a3a3f]">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#5a5a5f]">SECTOR:</span>
                <div className="inline-flex gap-1">
                  {['All', 'Mangaluru', 'Udupi', 'Bengaluru'].map((city) => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={`px-3 py-1 text-[11px] font-mono uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                        selectedCity === city
                          ? 'bg-[#ffffff] text-[#000000] font-bold'
                          : 'border border-[#3a3a3f] text-[#f0f0fa] hover:border-[#ffffff]'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[11px] font-mono uppercase tracking-wider text-[#5a5a5f] flex items-center gap-2">
                <span>AUTHORITY:</span>
                <span className="text-[#f0f0fa]">CPCB NATIONAL INVENTORY & KSPCB REPORTS</span>
              </div>
            </div>

            {/* Interactive Vector Map Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Map Canvas */}
              <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#3a3a3f] p-6 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-3 mb-4">
                  <div>
                    <h3 className="text-xs font-mono uppercase tracking-widest text-[#ffffff] font-bold flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      SPATIAL DISTRIBUTION OF URBAN E-WASTE HOTSPOTS [{selectedCity.toUpperCase()}]
                    </h3>
                    <p className="text-[11px] text-[#5a5a5f] font-mono mt-0.5">
                      SELECT PIN TO INSPECT MUNICIPAL DOSSIER & RECORDED TONNAGE
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono uppercase">
                    <span className="flex items-center gap-1.5 text-[#ffffff]">
                      <span className="w-2 h-2 rounded-full bg-[#ffffff] animate-ping" /> CRITICAL (&gt;100 MT)
                    </span>
                    <span className="flex items-center gap-1.5 text-[#f0f0fa]">
                      <span className="w-2 h-2 rounded-full bg-[#ffffff]" /> HIGH (40-100 MT)
                    </span>
                    <span className="flex items-center gap-1.5 text-[#5a5a5f]">
                      <span className="w-2 h-2 rounded-full border border-[#5a5a5f]" /> NOMINAL (&lt;40 MT)
                    </span>
                  </div>
                </div>

                {/* Vector Map Canvas */}
                <div className="relative w-full h-[420px] bg-[#000000] border border-[#3a3a3f] overflow-hidden flex items-center justify-center p-4">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 bg-[radial-gradient(#3a3a3f_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

                  {/* Coastline / City Boundary Graphic Line */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M 50,380 Q 120,300 180,240 T 320,180 T 500,120 T 700,40"
                      fill="none"
                      stroke="#3a3a3f"
                      strokeWidth="2"
                      strokeDasharray="6 6"
                    />
                    <text x="60" y="360" fill="#5a5a5f" fontSize="10" fontFamily="monospace" letterSpacing="1px">ARABIAN SEA COASTLINE // DAKSHINA KANNADA & UDUPI</text>
                  </svg>

                  {/* Dynamic Hotspot Pins */}
                  <div className="relative w-full h-full">
                    {hotspots.map((h, i) => {
                      let topPercent = 50;
                      let leftPercent = 50;

                      if (selectedCity === 'Mangaluru') {
                        const offsets = [
                          { t: 25, l: 30 },
                          { t: 65, l: 55 },
                          { t: 75, l: 40 },
                          { t: 70, l: 75 },
                          { t: 45, l: 60 },
                        ];
                        topPercent = offsets[i % offsets.length].t;
                        leftPercent = offsets[i % offsets.length].l;
                      } else if (selectedCity === 'Udupi') {
                        const offsets = [
                          { t: 30, l: 65 },
                          { t: 55, l: 40 },
                          { t: 80, l: 55 },
                        ];
                        topPercent = offsets[i % offsets.length].t;
                        leftPercent = offsets[i % offsets.length].l;
                      } else if (selectedCity === 'Bengaluru') {
                        const offsets = [
                          { t: 55, l: 48 },
                          { t: 30, l: 32 },
                          { t: 75, l: 80 },
                          { t: 65, l: 30 },
                        ];
                        topPercent = offsets[i % offsets.length].t;
                        leftPercent = offsets[i % offsets.length].l;
                      } else {
                        if (h.city === 'Mangaluru') {
                          topPercent = 60 + (i * 6);
                          leftPercent = 20 + (i * 5);
                        } else if (h.city === 'Udupi') {
                          topPercent = 25 + (i * 8);
                          leftPercent = 22 + (i * 4);
                        } else {
                          topPercent = 40 + ((i - 8) * 12);
                          leftPercent = 70 + ((i - 8) * 5);
                        }
                      }

                      const isSelected = selectedHotspot?.id === h.id;

                      return (
                        <div
                          key={h.id}
                          onClick={() => setSelectedHotspot(h)}
                          style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                        >
                          {h.severity === 'Critical' && (
                            <span className="absolute -inset-2 rounded-full border border-[#ffffff] animate-ping pointer-events-none" />
                          )}

                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                              isSelected
                                ? 'bg-[#ffffff] text-[#000000] border-[#ffffff] scale-125'
                                : 'bg-[#000000] text-[#ffffff] border-[#3a3a3f] hover:border-[#ffffff] hover:scale-110'
                            }`}
                          >
                            <MapPin className="w-3.5 h-3.5" />
                          </div>

                          {/* Hover Tooltip Label */}
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#000000] text-[#ffffff] text-[10px] font-mono px-2 py-1 border border-[#3a3a3f] whitespace-nowrap pointer-events-none z-30">
                            {h.name.toUpperCase()} [{h.annualEstimatedEwasteMT} MT/YR]
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Watermark Region Badge */}
                  <div className="absolute bottom-3 left-3 bg-[#0a0a0a] px-3 py-1.5 border border-[#3a3a3f] text-[10px] font-mono text-[#5a5a5f] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffffff]"></span>
                    <span>SECTOR TELEMETRY // ACTIVE VIEW: <strong>{selectedCity.toUpperCase()}</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Col: Selected Hotspot Deep Dive Card */}
              <div className="bg-[#0a0a0a] border border-[#3a3a3f] p-6 space-y-4">
                {selectedHotspot ? (
                  <>
                    <div className="border-b border-[#3a3a3f] pb-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#5a5a5f]">
                          {selectedHotspot.city} // {selectedHotspot.municipalBody}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border border-[#3a3a3f] text-[#ffffff]">
                          {selectedHotspot.severity} PRIORITY
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#ffffff] font-mono uppercase">
                        {selectedHotspot.name}
                      </h4>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#5a5a5f] block">
                          CATEGORY & CLASSIFICATION
                        </span>
                        <p className="text-[#f0f0fa] mt-1 font-mono">{selectedHotspot.category}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 bg-[#000000] p-3 border border-[#3a3a3f]">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#5a5a5f] block">ANNUAL FLOW</span>
                          <span className="text-base font-bold text-[#ffffff] font-mono">
                            {selectedHotspot.annualEstimatedEwasteMT} MT / YR
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#5a5a5f] block">COORDINATES</span>
                          <span className="text-xs font-mono text-[#f0f0fa]">
                            {selectedHotspot.lat.toFixed(4)}°N, {selectedHotspot.lng.toFixed(4)}°E
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#5a5a5f] block">
                          DOMINANT WASTE STREAMS
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {selectedHotspot.dominantWasteTypes.map((item, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono uppercase border border-[#3a3a3f] text-[#f0f0fa] px-2 py-0.5 bg-[#000000]"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#5a5a5f] block">
                          NEAREST AUTHORIZED CENTER
                        </span>
                        <p className="text-[#ffffff] font-mono mt-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#ffffff] shrink-0" />
                          {selectedHotspot.nearestAuthorizedCenter}
                        </p>
                      </div>

                      {/* Official Source Reference Box */}
                      <div className="bg-[#000000] border border-[#3a3a3f] p-3 space-y-1 font-mono">
                        <span className="text-[10px] uppercase tracking-widest text-[#5a5a5f] block">
                          OFFICIAL REPORT CITATION:
                        </span>
                        <p className="text-[11px] text-[#f0f0fa] leading-snug">
                          {selectedHotspot.sourceReport}
                        </p>
                        <a
                          href={selectedHotspot.sourceReportUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#ffffff] hover:underline pt-1"
                        >
                          DOCUMENT CITATION <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <button
                        onClick={() => {
                          setPickupForm((prev) => ({
                            ...prev,
                            city: selectedHotspot.city,
                            locationName: selectedHotspot.name,
                            pickupAddress: `${selectedHotspot.name}, ${selectedHotspot.city}`,
                          }));
                          setIsPickupModalOpen(true);
                        }}
                        className="w-full py-2.5 rounded-full border border-[#ffffff] text-[#000000] bg-[#ffffff] hover:bg-transparent hover:text-[#ffffff] text-[11px] font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        DISPATCH DRIVE TO THIS HOTSPOT
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-[#5a5a5f] text-xs font-mono uppercase tracking-widest">
                    SELECT HOTSPOT PIN ON VECTOR MAP TO INSPECT
                  </div>
                )}
              </div>
            </div>

            {/* Hotspots Master List Table */}
            <div className="bg-[#0a0a0a] border border-[#3a3a3f] overflow-hidden">
              <div className="p-4 border-b border-[#3a3a3f] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-widest text-[#ffffff] font-bold">
                    VERIFIED CPCB / MUNICIPAL HOTSPOTS INVENTORY [{hotspots.length} LOCATIONS]
                  </h4>
                  <p className="text-[11px] text-[#5a5a5f] font-mono mt-0.5">
                    DERIVED FROM OFFICIAL ENVIRONMENTAL AUDITS AND MUNICIPAL FIELD SURVEYS
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#000000] text-[#5a5a5f] border-b border-[#3a3a3f] uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">LOCATION NAME</th>
                      <th className="py-3 px-4">CIVIC BODY</th>
                      <th className="py-3 px-4">CATEGORY</th>
                      <th className="py-3 px-4">FLOW (MT/YR)</th>
                      <th className="py-3 px-4">SEVERITY</th>
                      <th className="py-3 px-4">OFFICIAL CITATION</th>
                      <th className="py-3 px-4">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3a3a3f]">
                    {hotspots.map((h) => (
                      <tr
                        key={h.id}
                        className={`hover:bg-[#141416] transition-colors ${
                          selectedHotspot?.id === h.id ? 'bg-[#141416]' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-[#ffffff]">
                          {h.name}
                        </td>
                        <td className="py-3 px-4 text-[#f0f0fa]">
                          <div>{h.city}</div>
                          <div className="text-[10px] text-[#5a5a5f]">{h.municipalBody}</div>
                        </td>
                        <td className="py-3 px-4 text-[#5a5a5f]">{h.category}</td>
                        <td className="py-3 px-4 font-bold text-[#ffffff]">
                          {h.annualEstimatedEwasteMT}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] border border-[#3a3a3f] px-2 py-0.5 text-[#ffffff] uppercase tracking-wider">
                            {h.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#5a5a5f] max-w-xs truncate" title={h.sourceReport}>
                          {h.sourceReport}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setSelectedHotspot(h)}
                            className="text-[11px] uppercase tracking-wider font-bold text-[#ffffff] hover:underline cursor-pointer"
                          >
                            INSPECT
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Aggregated Campus E-Waste Data (Anonymized) */}
        {activeTab === 'aggregated' && (
          <div className="space-y-6 font-mono">
            {/* Privacy Guarantee Dossier */}
            <div className="bg-[#0a0a0a] border border-[#3a3a3f] p-6 flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-[#ffffff] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs uppercase tracking-widest text-[#ffffff] font-bold flex items-center gap-3">
                  <span>ANONYMIZED CIVIC TELEMETRY STREAM</span>
                  <span className="text-[10px] border border-[#3a3a3f] px-2 py-0.5 text-[#5a5a5f]">
                    DPDP ACT 2023 COMPLIANT
                  </span>
                </h4>
                <p className="text-xs text-[#f0f0fa] leading-relaxed">
                  {aggregatedData?.anonymizationDisclaimer?.guarantee ||
                    'All student personal identifiable markers (names, identifiers, dorm rooms, contact channels) are stripped prior to aggregation. Civic partners receive exclusively bulk verified tonnage, material recovery coefficients, and sector densities.'}
                </p>
              </div>
            </div>

            {/* Aggregated Totals Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0a0a0a] p-6 border border-[#3a3a3f]">
                <span className="text-[10px] uppercase tracking-widest text-[#5a5a5f] block">GROSS DIVERTED</span>
                <div className="text-2xl sm:text-3xl font-bold text-[#ffffff] mt-1">
                  {aggregatedData?.aggregatedTotals?.totalWeightDivertedKg || 0} <span className="text-sm font-normal text-[#5a5a5f]">KG</span>
                </div>
                <span className="text-[10px] uppercase text-[#5a5a5f] mt-1 block">CALIBRATED LOG</span>
              </div>

              <div className="bg-[#0a0a0a] p-6 border border-[#3a3a3f]">
                <span className="text-[10px] uppercase tracking-widest text-[#5a5a5f] block">VERIFIED RECYCLED</span>
                <div className="text-2xl sm:text-3xl font-bold text-[#ffffff] mt-1">
                  {aggregatedData?.aggregatedTotals?.totalVerifiedRecycledKg || 0} <span className="text-sm font-normal text-[#5a5a5f]">KG</span>
                </div>
                <span className="text-[10px] uppercase text-[#5a5a5f] mt-1 block">CPCB DISMANTLED</span>
              </div>

              <div className="bg-[#0a0a0a] p-6 border border-[#3a3a3f]">
                <span className="text-[10px] uppercase tracking-widest text-[#5a5a5f] block">AVOIDED CO₂E</span>
                <div className="text-2xl sm:text-3xl font-bold text-[#ffffff] mt-1">
                  {aggregatedData?.aggregatedTotals?.avoidedCo2eKg || 0} <span className="text-sm font-normal text-[#5a5a5f]">KG</span>
                </div>
                <span className="text-[10px] uppercase text-[#5a5a5f] mt-1 block">GEM 2024 STANDARD</span>
              </div>

              <div className="bg-[#0a0a0a] p-6 border border-[#3a3a3f]">
                <span className="text-[10px] uppercase tracking-widest text-[#5a5a5f] block">TOTAL UNITS</span>
                <div className="text-2xl sm:text-3xl font-bold text-[#ffffff] mt-1">
                  {aggregatedData?.aggregatedTotals?.totalItemsCollected || 0} <span className="text-sm font-normal text-[#5a5a5f]">UNITS</span>
                </div>
                <span className="text-[10px] uppercase text-[#5a5a5f] mt-1 block">OPTICAL QR AUDITED</span>
              </div>
            </div>

            {/* Category Breakdown & Material Recovery Projection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <div className="bg-[#0a0a0a] border border-[#3a3a3f] p-6 space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-[#ffffff] font-bold flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  AGGREGATED E-WASTE CATEGORY FRACTIONS
                </h4>

                <div className="space-y-4">
                  {(aggregatedData?.categoryBreakdown || []).map((cat) => (
                    <div key={cat.category} className="space-y-1.5">
                      <div className="flex justify-between text-xs text-[#f0f0fa]">
                        <span className="uppercase">{cat.category}</span>
                        <span>{cat.totalKg} KG [{cat.percentage}%]</span>
                      </div>
                      <div className="w-full bg-[#000000] border border-[#3a3a3f] h-2">
                        <div
                          className="bg-[#ffffff] h-full transition-all"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Material Recovery Projection */}
              <div className="bg-[#0a0a0a] border border-[#3a3a3f] p-6 space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-[#ffffff] font-bold flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  PROJECTED RESOURCE EXTRACTION (CPCB BENCHMARK)
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#000000] p-4 border border-[#3a3a3f]">
                    <span className="text-[10px] uppercase text-[#5a5a5f] block">FERROUS METALS</span>
                    <span className="text-lg font-bold text-[#ffffff] block mt-1">
                      {aggregatedData?.estimatedMaterialRecoveryKg?.ferrousMetals || 0} KG
                    </span>
                    <span className="text-[10px] text-[#5a5a5f] block mt-0.5">CHASSIS & FRAMES (40%)</span>
                  </div>

                  <div className="bg-[#000000] p-4 border border-[#3a3a3f]">
                    <span className="text-[10px] uppercase text-[#5a5a5f] block">COPPER & ALLOYS</span>
                    <span className="text-lg font-bold text-[#ffffff] block mt-1">
                      {aggregatedData?.estimatedMaterialRecoveryKg?.copperAndAlloys || 0} KG
                    </span>
                    <span className="text-[10px] text-[#5a5a5f] block mt-0.5">WIRING & COILS (15%)</span>
                  </div>

                  <div className="bg-[#000000] p-4 border border-[#3a3a3f]">
                    <span className="text-[10px] uppercase text-[#5a5a5f] block">ALUMINUM</span>
                    <span className="text-lg font-bold text-[#ffffff] block mt-1">
                      {aggregatedData?.estimatedMaterialRecoveryKg?.aluminum || 0} KG
                    </span>
                    <span className="text-[10px] text-[#5a5a5f] block mt-0.5">HEATSINKS (12%)</span>
                  </div>

                  <div className="bg-[#000000] p-4 border border-[#3a3a3f]">
                    <span className="text-[10px] uppercase text-[#5a5a5f] block">ENGINEERING PLASTICS</span>
                    <span className="text-lg font-bold text-[#ffffff] block mt-1">
                      {aggregatedData?.estimatedMaterialRecoveryKg?.engineeringPlastics || 0} KG
                    </span>
                    <span className="text-[10px] text-[#5a5a5f] block mt-0.5">ABS / POLYCARBONATE (18%)</span>
                  </div>
                </div>

                <div className="bg-[#000000] border border-[#3a3a3f] p-3 text-[11px] text-[#f0f0fa] leading-relaxed">
                  <span className="text-[#5a5a5f] uppercase tracking-wider block mb-1">PRECIOUS METALS TELEMETRY:</span>
                  ESTIMATED <strong className="text-[#ffffff]">{aggregatedData?.estimatedMaterialRecoveryKg?.preciousMetalsGrams || 0} GRAMS</strong> OF GOLD/SILVER/PALLADIUM RECOVERABLE VIA PYROMETALLURGICAL EXTRACTION.
                </div>
              </div>
            </div>

            {/* Hostel Distribution */}
            <div className="bg-[#0a0a0a] border border-[#3a3a3f] p-6 space-y-4">
              <h4 className="text-xs uppercase tracking-widest text-[#ffffff] font-bold flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                CAMPUS WARD DIVERSION TELEMETRY
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {(aggregatedData?.hostelBreakdown || []).map((h) => (
                  <div key={h.hostel} className="bg-[#000000] p-4 border border-[#3a3a3f] text-center">
                    <div className="text-xs font-bold text-[#ffffff] uppercase">{h.hostel === 'Hostel Institutional Lab Bay 1' ? 'Yourspace' : h.hostel}</div>
                    <div className="text-lg font-bold text-[#ffffff] mt-1">{h.totalKg} KG</div>
                    <div className="text-[10px] text-[#5a5a5f] mt-0.5">{h.count} UNITS ({h.sharePercentage}%)</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Community Bulk Pickups for Drives */}
        {activeTab === 'drives' && (
          <div className="space-y-6 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#ffffff] uppercase tracking-widest">
                  COMMUNITY E-WASTE CAMPAIGNS & BULK DISPATCH LOG
                </h3>
                <p className="text-[11px] text-[#5a5a5f] mt-0.5">
                  SCHEDULED BULK COLLECTIONS COORDINATED WITH STATUTORY BODIES AND NGOS
                </p>
              </div>

              <button
                onClick={() => setIsPickupModalOpen(true)}
                className="px-5 py-2.5 rounded-full text-[12px] uppercase tracking-wider font-bold text-[#000000] bg-[#ffffff] hover:bg-transparent hover:text-[#ffffff] border border-[#ffffff] flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4" />
                REQUEST BULK PICKUP
              </button>
            </div>

            {/* Pickups Table */}
            <div className="bg-[#0a0a0a] border border-[#3a3a3f] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#000000] text-[#5a5a5f] border-b border-[#3a3a3f] uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">REF CODE</th>
                      <th className="py-3 px-4">CAMPAIGN & ENTITY</th>
                      <th className="py-3 px-4">LOCATION</th>
                      <th className="py-3 px-4">EST. WEIGHT</th>
                      <th className="py-3 px-4">SCHEDULED DATE</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4">COLLECTION LEAD</th>
                      <th className="py-3 px-4">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3a3a3f]">
                    {bulkPickups.map((b) => (
                      <tr key={b._id} className="hover:bg-[#141416] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#ffffff]">
                          {b.referenceCode}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#ffffff] uppercase">{b.driveTitle}</div>
                          <div className="text-[10px] text-[#5a5a5f] flex items-center gap-2 mt-0.5">
                            <span className="border border-[#3a3a3f] px-1 py-0.2 uppercase text-[9px] text-[#f0f0fa]">
                              {b.partnerType}
                            </span>
                            <span>{b.partnerName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#f0f0fa]">
                          <div>{b.locationName}</div>
                          <div className="text-[10px] text-[#5a5a5f]">{b.city}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#ffffff]">
                          {b.approxWeightKg} KG
                          <div className="text-[10px] text-[#5a5a5f] font-normal">
                            ~{b.estimatedItemCount} UNITS
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#f0f0fa]">
                          {b.proposedDate}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] border border-[#3a3a3f] px-2 py-0.5 uppercase tracking-wider text-[#ffffff]">
                            {b.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#5a5a5f]">
                          {b.assignedCollector || 'PIYUSH RAJ (COLLECTION LEAD)'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {b.status === 'requested' && (
                              <button
                                onClick={() => handleStatusUpdate(b._id, 'confirmed')}
                                className="px-3 py-1 border border-[#ffffff] text-[#000000] bg-[#ffffff] hover:bg-transparent hover:text-[#ffffff] rounded-full text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer"
                              >
                                CONFIRM
                              </button>
                            )}
                            {b.status === 'confirmed' && (
                              <button
                                onClick={() => handleStatusUpdate(b._id, 'in_progress')}
                                className="px-3 py-1 border border-[#3a3a3f] text-[#ffffff] hover:border-[#ffffff] rounded-full text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer"
                              >
                                INITIATE
                              </button>
                            )}
                            {b.status === 'in_progress' && (
                              <button
                                onClick={() => handleStatusUpdate(b._id, 'completed')}
                                className="px-3 py-1 border border-[#ffffff] text-[#000000] bg-[#ffffff] hover:bg-transparent hover:text-[#ffffff] rounded-full text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer"
                              >
                                COMPLETE
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Registered Municipalities & NGOs Directory */}
        {activeTab === 'directory' && (
          <div className="space-y-6 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#ffffff] uppercase tracking-widest">
                  REGISTERED MUNICIPALITIES & NGO DIRECTORY
                </h3>
                <p className="text-[11px] text-[#5a5a5f] mt-0.5">
                  VERIFIED STATUTORY BODIES AND TRUSTS COOPERATING IN CIRCULAR DISMANTLING
                </p>
              </div>

              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="px-5 py-2.5 rounded-full text-[12px] uppercase tracking-wider font-bold text-[#000000] bg-[#ffffff] hover:bg-transparent hover:text-[#ffffff] border border-[#ffffff] flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4" />
                REGISTER ENTITY
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((p) => (
                <div
                  key={p._id}
                  className="bg-[#0a0a0a] border border-[#3a3a3f] p-6 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] border border-[#3a3a3f] px-2 py-0.5 uppercase tracking-widest text-[#5a5a5f]">
                        {p.orgType === 'municipality' ? 'MUNICIPAL BODY' : 'REGISTERED NGO'}
                      </span>
                      <span className="text-[10px] text-[#5a5a5f]">
                        {p.registrationNumber}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#ffffff] uppercase">{p.orgName}</h4>
                    <p className="text-xs text-[#5a5a5f] line-clamp-2">{p.notes}</p>
                  </div>

                  <div className="pt-4 border-t border-[#3a3a3f] space-y-2 text-xs text-[#f0f0fa]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#5a5a5f] shrink-0" />
                      <span>{p.officialAddress || `${p.city}, ${p.state}`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#5a5a5f] shrink-0" />
                      <a href={`mailto:${p.contactEmail}`} className="text-[#ffffff] hover:underline">
                        {p.contactEmail}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#5a5a5f] shrink-0" />
                      <span>{p.contactPhone}</span>
                    </div>

                    {p.website && (
                      <div className="pt-2">
                        <a
                          href={p.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] uppercase font-bold text-[#ffffff] hover:underline"
                        >
                          OFFICIAL SITE <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: Request Bulk Pickup for Community Drive */}
      {isPickupModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#000000] border border-[#3a3a3f] max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto font-mono">
            <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#ffffff]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#ffffff]">
                  DISPATCH BULK CAMPAIGN PICKUP
                </h3>
              </div>
              <button
                onClick={() => setIsPickupModalOpen(false)}
                className="text-[#5a5a5f] hover:text-[#ffffff] font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePickup} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#5a5a5f] block mb-1">
                  PARTNER ORGANIZATION *
                </label>
                <select
                  value={pickupForm.partnerName}
                  onChange={(e) => {
                    const found = partners.find((p) => p.orgName === e.target.value);
                    setPickupForm((prev) => ({
                      ...prev,
                      partnerName: e.target.value,
                      partnerType: found?.orgType || 'ngo',
                      city: found?.city || prev.city,
                    }));
                  }}
                  className="w-full p-2.5 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff] text-xs focus:outline-hidden focus:border-[#ffffff]"
                >
                  {partners.map((p) => (
                    <option key={p._id} value={p.orgName}>
                      {p.orgName} ({p.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#5a5a5f] block mb-1">
                  CAMPAIGN TITLE *
                </label>
                <input
                  type="text"
                  required
                  value={pickupForm.driveTitle}
                  onChange={(e) => setPickupForm({ ...pickupForm, driveTitle: e.target.value })}
                  placeholder="e.g. MANGALURU WARD 12 CITIZEN DRIVE"
                  className="w-full p-2.5 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff] text-xs focus:outline-hidden focus:border-[#ffffff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#5a5a5f] block mb-1">
                    CITY *
                  </label>
                  <select
                    value={pickupForm.city}
                    onChange={(e) => setPickupForm({ ...pickupForm, city: e.target.value })}
                    className="w-full p-2.5 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff] text-xs focus:outline-hidden focus:border-[#ffffff]"
                  >
                    <option value="Mangaluru">Mangaluru</option>
                    <option value="Udupi">Udupi</option>
                    <option value="Bengaluru">Bengaluru</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#5a5a5f] block mb-1">
                    LOCATION / WARD *
                  </label>
                  <input
                    type="text"
                    required
                    value={pickupForm.locationName}
                    onChange={(e) => setPickupForm({ ...pickupForm, locationName: e.target.value })}
                    placeholder="e.g. TOWN HALL"
                    className="w-full p-2.5 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff] text-xs focus:outline-hidden focus:border-[#ffffff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#5a5a5f] block mb-1">
                    EST. WEIGHT (KG) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="0.5"
                    required
                    value={pickupForm.approxWeightKg}
                    onChange={(e) => setPickupForm({ ...pickupForm, approxWeightKg: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff] text-xs focus:outline-hidden focus:border-[#ffffff]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#5a5a5f] block mb-1">
                    DATE *
                  </label>
                  <input
                    type="date"
                    required
                    value={pickupForm.proposedDate}
                    onChange={(e) => setPickupForm({ ...pickupForm, proposedDate: e.target.value })}
                    className="w-full p-2.5 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff] text-xs focus:outline-hidden focus:border-[#ffffff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#5a5a5f] block mb-1">
                  ADDRESS & DISPATCH INSTRUCTIONS *
                </label>
                <textarea
                  required
                  rows={2}
                  value={pickupForm.pickupAddress}
                  onChange={(e) => setPickupForm({ ...pickupForm, pickupAddress: e.target.value })}
                  className="w-full p-2.5 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff] text-xs focus:outline-hidden focus:border-[#ffffff]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#3a3a3f]">
                <button
                  type="button"
                  onClick={() => setIsPickupModalOpen(false)}
                  className="px-4 py-2 border border-[#3a3a3f] text-[#5a5a5f] hover:text-[#ffffff] rounded-full uppercase tracking-wider text-[11px] font-bold cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 border border-[#ffffff] text-[#000000] bg-[#ffffff] hover:bg-transparent hover:text-[#ffffff] rounded-full uppercase tracking-wider text-[11px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'DISPATCHING...' : 'CONFIRM REQUEST'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Register New Municipal or NGO Partner */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#000000] border border-[#3a3a3f] max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto font-mono">
            <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#ffffff]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#ffffff]">
                  REGISTER CIVIC / NGO ENTITY
                </h3>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-[#5a5a5f] hover:text-[#ffffff] font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterPartner} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#5a5a5f] block mb-1">
                  ORGANIZATION NAME *
                </label>
                <input
                  type="text"
                  required
                  value={partnerForm.orgName}
                  onChange={(e) => setPartnerForm({ ...partnerForm, orgName: e.target.value })}
                  placeholder="e.g. MANGALURU CITY CORPORATION"
                  className="w-full p-2.5 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff] text-xs focus:outline-hidden focus:border-[#ffffff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#5a5a5f] block mb-1">
                    ENTITY TYPE *
                  </label>
                  <select
                    value={partnerForm.orgType}
                    onChange={(e) => setPartnerForm({ ...partnerForm, orgType: e.target.value })}
                    className="w-full p-2.5 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff] text-xs focus:outline-hidden focus:border-[#ffffff]"
                  >
                    <option value="municipality">MUNICIPAL BODY / ULB</option>
                    <option value="ngo">REGISTERED NGO / TRUST</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#5a5a5f] block mb-1">
                    CITY *
                  </label>
                  <select
                    value={partnerForm.city}
                    onChange={(e) => setPartnerForm({ ...partnerForm, city: e.target.value })}
                    className="w-full p-2.5 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff] text-xs focus:outline-hidden focus:border-[#ffffff]"
                  >
                    <option value="Mangaluru">Mangaluru</option>
                    <option value="Udupi">Udupi</option>
                    <option value="Bengaluru">Bengaluru</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#5a5a5f] block mb-1">
                    REGISTRATION ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerForm.registrationNumber}
                    onChange={(e) => setPartnerForm({ ...partnerForm, registrationNumber: e.target.value })}
                    placeholder="e.g. NGO-DARPAN-KA-2018"
                    className="w-full p-2.5 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff] text-xs focus:outline-hidden focus:border-[#ffffff]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#5a5a5f] block mb-1">
                    CONTACT PERSON *
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerForm.contactPerson}
                    onChange={(e) => setPartnerForm({ ...partnerForm, contactPerson: e.target.value })}
                    placeholder="e.g. EXECUTIVE OFFICER"
                    className="w-full p-2.5 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff] text-xs focus:outline-hidden focus:border-[#ffffff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#5a5a5f] block mb-1">
                    OFFICIAL EMAIL *
                  </label>
                  <input
                    type="email"
                    required
                    value={partnerForm.contactEmail}
                    onChange={(e) => setPartnerForm({ ...partnerForm, contactEmail: e.target.value })}
                    placeholder="official@municipality.gov.in"
                    className="w-full p-2.5 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff] text-xs focus:outline-hidden focus:border-[#ffffff]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#5a5a5f] block mb-1">
                    PHONE *
                  </label>
                  <input
                    type="tel"
                    required
                    value={partnerForm.contactPhone}
                    onChange={(e) => setPartnerForm({ ...partnerForm, contactPhone: e.target.value })}
                    placeholder="+91-824-2220000"
                    className="w-full p-2.5 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff] text-xs focus:outline-hidden focus:border-[#ffffff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#5a5a5f] block mb-1">
                  OFFICIAL ADDRESS
                </label>
                <input
                  type="text"
                  value={partnerForm.officialAddress}
                  onChange={(e) => setPartnerForm({ ...partnerForm, officialAddress: e.target.value })}
                  placeholder="Civic Centre, Main Road"
                  className="w-full p-2.5 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff] text-xs focus:outline-hidden focus:border-[#ffffff]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#3a3a3f]">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 border border-[#3a3a3f] text-[#5a5a5f] hover:text-[#ffffff] rounded-full uppercase tracking-wider text-[11px] font-bold cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 border border-[#ffffff] text-[#000000] bg-[#ffffff] hover:bg-transparent hover:text-[#ffffff] rounded-full uppercase tracking-wider text-[11px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'REGISTERING...' : 'CONFIRM REGISTRATION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

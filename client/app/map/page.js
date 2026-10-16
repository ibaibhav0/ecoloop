'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  MapPin,
  Navigation,
  Compass,
  Building,
  Recycle,
  ShieldCheck,
  Clock,
  Phone,
  ArrowLeft,
  Crosshair,
  ExternalLink,
} from 'lucide-react';

export default function CampusMapPage() {
  const { user } = useAuth();
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('campus'); // 'campus', 'recyclers', 'all'
  const [selectedHostel, setSelectedHostel] = useState(user?.hostel || 'Nandani');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');

  const loadData = async (lat = null, lng = null, hostel = selectedHostel) => {
    try {
      setLoading(true);
      const params = {};
      if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
      } else if (hostel) {
        params.hostel = hostel;
      }
      const res = await api.getMapLocations(params);
      if (res.success) {
        setMapData(res);
        if (res.nearestDropoffPoint && !selectedLocation) {
          setSelectedLocation(res.nearestDropoffPoint);
        }
      }
    } catch (err) {
      console.warn('Error loading map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(null, null, selectedHostel);
  }, [selectedHostel]);

  const handleUseBrowserGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus('GEOLOCATION SENSOR NOT AVAILABLE.');
      return;
    }
    setGpsStatus('ACQUIRING REAL-TIME GPS COORDINATES...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsActive(true);
        setGpsStatus(`GPS LOCKED: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`);
        loadData(latitude, longitude, null);
      },
      (error) => {
        setGpsStatus('GPS TELEMETRY DENIED. RESUMING HOSTEL ANCHOR.');
        setTimeout(() => setGpsStatus(''), 3000);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const campusPoints = mapData?.campusCollectionPoints || [];
  const recyclers = mapData?.cpcbAuthorisedRecyclers || [];
  const nearest = mapData?.nearestDropoffPoint || campusPoints[0];

  return (
    <div className="min-h-screen bg-[#000000] text-[#f0f0fa] flex flex-col font-sans">
      {/* Top Header */}
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
              className="btn-spacex"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ffffff] inline-block" />
              <h1 className="font-['D-DIN-Bold'] text-sm uppercase tracking-wider text-[#ffffff]">
                CAMPUS COLLECTION GRID &amp; CPCB RECYCLER LOGISTICS
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleUseBrowserGPS}
              className={`btn-spacex ${gpsActive ? 'bg-[#ffffff] text-[#000000]' : 'btn-spacex-muted'}`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>{gpsActive ? 'GPS ACTIVE' : 'USE GPS'}</span>
            </button>
            <Link href="/register" className="btn-spacex">
              <span>Register E-Waste</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b border-[#3a3a3f] px-6 py-12 bg-[#000000]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="spacex-caption">// GEOSPATIAL TELEMETRY &amp; CPCB REGISTRY</div>
            <h2 className="font-['D-DIN-Bold'] text-4xl sm:text-5xl font-black text-[#ffffff] uppercase tracking-tight leading-[0.95]">
              CAMPUS COLLECTION VECTOR MAP
            </h2>
            <p className="text-base text-[#f0f0fa] leading-relaxed">
              Real-time proximity coordinates for all hostel collection bins (Nandani, Kaveri, Kumardhara, Saupernikha, Shambhavi, Netravati) and state-authorized CPCB dismantling hubs in Karnataka.
            </p>
          </div>

          {/* Quick Hostel Anchor Selector */}
          <div className="bg-[#0a0a0a] border border-[#3a3a3f] p-6 space-y-3 shrink-0 max-w-sm w-full">
            <div className="flex items-center justify-between text-xs">
              <span className="spacex-caption flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-[#ffffff]" />
                ORIGIN STATION ANCHOR:
              </span>
            </div>
            <select
              value={selectedHostel}
              onChange={(e) => {
                setSelectedHostel(e.target.value);
                setGpsActive(false);
              }}
              className="w-full bg-[#000000] border border-[#3a3a3f] p-3 text-xs text-[#ffffff] font-mono focus:border-[#ffffff]"
            >
              <option value="Nandani">STATION NANDANI</option>
              <option value="Kaveri">STATION KAVERI</option>
              <option value="Kumardhara">STATION KUMARDHARA</option>
              <option value="Saupernikha">STATION SAUPERNIKHA</option>
              <option value="Shambhavi">STATION SHAMBHAVI</option>
              <option value="Netravati">STATION NETRAVATI</option>
              <option value="CSE Block">ACADEMIC QUAD: CSE &amp; IT</option>
              <option value="Central Library">CENTRAL CAMPUS DEPOT</option>
            </select>
            {gpsStatus && (
              <p className="text-[11px] text-[#ffffff] font-mono">
                {gpsStatus}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 flex-1 space-y-12">
        {/* RECOMMENDED NEAREST DROP-OFF CALLOUT */}
        {nearest && (
          <div className="border border-[#ffffff] bg-[#0a0a0a] p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="spacex-caption text-[#ffffff]">
                  // RECOMMENDED NEAREST DEPOT FOR YOUR STATION
                </div>
                <h3 className="font-['D-DIN-Bold'] text-3xl font-black text-[#ffffff] uppercase">
                  {nearest.name}
                </h3>
                <p className="text-xs text-[#5a5a5f] font-mono flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#ffffff] shrink-0" />
                  <span>{nearest.locationDesc}</span>
                </p>
              </div>

              <div className="flex items-center gap-8 border-l border-[#3a3a3f] pl-8 shrink-0">
                <div>
                  <div className="font-['D-DIN-Bold'] text-3xl font-bold text-[#ffffff]">
                    {nearest.distanceMeters !== undefined ? `${nearest.distanceMeters} M` : 'PROXIMATE'}
                  </div>
                  <div className="spacex-caption text-[10px]">PHYSICAL DISTANCE</div>
                </div>
                <div className="border-l border-[#3a3a3f] pl-8">
                  <div className="font-['D-DIN-Bold'] text-3xl font-bold text-[#ffffff]">
                    ~{nearest.estimatedWalkingMinutes || 1} MIN
                  </div>
                  <div className="spacex-caption text-[10px]">WALKING TIME</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#3a3a3f] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#5a5a5f]">
              <div className="flex items-center gap-6">
                <span>OPERATING: {nearest.operatingHours}</span>
                <span>CONTACT: {nearest.contactPhone} ({nearest.custodian})</span>
              </div>
              <button
                onClick={() => setSelectedLocation(nearest)}
                className="btn-spacex py-1.5 px-4 text-xs"
              >
                INSPECT TELEMETRY &rarr;
              </button>
            </div>
          </div>
        )}

        {/* View Mode Tabs Bar */}
        <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('campus')}
              className={`px-4 py-2 text-xs font-['D-DIN-Bold'] uppercase tracking-wider rounded-full border transition-all ${
                viewMode === 'campus'
                  ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                  : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff]'
              }`}
            >
              Campus Depots ({campusPoints.length})
            </button>
            <button
              onClick={() => setViewMode('recyclers')}
              className={`px-4 py-2 text-xs font-['D-DIN-Bold'] uppercase tracking-wider rounded-full border transition-all ${
                viewMode === 'recyclers'
                  ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                  : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff]'
              }`}
            >
              CPCB Recyclers ({recyclers.length})
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 text-xs font-['D-DIN-Bold'] uppercase tracking-wider rounded-full border transition-all ${
                viewMode === 'all'
                  ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                  : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff]'
              }`}
            >
              All Vectors
            </button>
          </div>

          <div className="spacex-caption hidden sm:block">
            LAT: 13.1824° N • LNG: 74.9339° E
          </div>
        </div>

        {/* MAP LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* MAP CANVAS (8 COLS) */}
          <div className="lg:col-span-8 border border-[#3a3a3f] bg-[#000000] p-6 text-white relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#ffffff]" />
                <span className="font-['D-DIN-Bold'] text-xs uppercase tracking-wider text-[#ffffff]">
                  {viewMode === 'campus'
                    ? 'CAMPUS DEPOSIT RECOVERY GRID'
                    : viewMode === 'recyclers'
                    ? 'KARNATAKA CPCB RECYCLER NETWORK'
                    : 'REGIONAL RECOVERY LOGISTICS GRID'}
                </span>
              </div>
              <span className="spacex-caption text-[10px]">
                MODE: {viewMode.toUpperCase()}
              </span>
            </div>

            {/* Visual Vector Coordinate Grid */}
            <div className="relative w-full h-[460px] bg-[#0a0a0a] border border-[#3a3a3f] overflow-hidden flex items-center justify-center p-4">
              {/* Radial Coordinate Grid Background */}
              <div className="absolute inset-0 bg-[radial-gradient(#3a3a3f_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>

              {/* Campus Roads SVG Overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
                <line x1="80" y1="230" x2="680" y2="230" stroke="#ffffff" strokeWidth="2" />
                <line x1="380" y1="50" x2="380" y2="420" stroke="#ffffff" strokeWidth="2" />
                <circle cx="380" cy="230" r="80" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 4" />
                <text x="390" y="225" fill="#ffffff" fontSize="10" fontFamily="sans-serif">CENTRAL QUAD</text>
                <text x="100" y="220" fill="#ffffff" fontSize="10" fontFamily="sans-serif">CAMPUS AVENUE</text>
              </svg>

              {/* Render Location Markers */}
              <div className="relative w-full h-full">
                {/* 1. Origin Pin */}
                <div
                  style={{ top: '48%', left: '46%' }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
                >
                  <div className="w-8 h-8 rounded-full border border-[#ffffff] flex items-center justify-center animate-ping"></div>
                  <div className="w-6 h-6 rounded-full bg-[#ffffff] text-[#000000] flex items-center justify-center absolute inset-1">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-[#000000] border border-[#3a3a3f] text-[#ffffff] font-mono text-[9px] px-2 py-0.5 whitespace-nowrap">
                    ORIGIN [{selectedHostel.toUpperCase()}]
                  </span>
                </div>

                {/* 2. Campus Collection Point Pins */}
                {(viewMode === 'campus' || viewMode === 'all') &&
                  campusPoints.map((cp, idx) => {
                    const offsets = [
                      { t: 25, l: 75 },
                      { t: 15, l: 65 },
                      { t: 70, l: 30 },
                      { t: 85, l: 45 },
                      { t: 55, l: 20 },
                      { t: 75, l: 60 },
                      { t: 38, l: 48 },
                      { t: 30, l: 38 },
                      { t: 45, l: 65 },
                      { t: 65, l: 80 },
                    ];
                    const pos = offsets[idx % offsets.length];
                    const isSelected = selectedLocation?.id === cp.id;
                    const isNearest = nearest?.id === cp.id;

                    return (
                      <div
                        key={cp.id}
                        onClick={() => setSelectedLocation(cp)}
                        style={{ top: `${pos.t}%`, left: `${pos.l}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                            isNearest
                              ? 'bg-[#ffffff] text-[#000000] border-[#ffffff] scale-110'
                              : isSelected
                              ? 'bg-[#ffffff] text-[#000000] border-[#ffffff]'
                              : 'bg-[#000000] text-[#ffffff] border-[#3a3a3f] hover:border-[#ffffff]'
                          }`}
                        >
                          <Building className="w-3.5 h-3.5" />
                        </div>

                        {/* Tooltip */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#000000] border border-[#3a3a3f] text-[#ffffff] text-[10px] font-mono px-2 py-1 whitespace-nowrap pointer-events-none z-30">
                          {cp.name}
                        </div>
                      </div>
                    );
                  })}

                {/* 3. CPCB Recycler Pins */}
                {(viewMode === 'recyclers' || viewMode === 'all') &&
                  recyclers.map((r, idx) => {
                    const offsets = [
                      { t: 75, l: 20 },
                      { t: 30, l: 25 },
                      { t: 35, l: 85 },
                      { t: 80, l: 70 },
                      { t: 45, l: 80 },
                    ];
                    const pos = offsets[idx % offsets.length];
                    const isSelected = selectedLocation?.id === r.id;

                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedLocation(r)}
                        style={{ top: `${pos.t}%`, left: `${pos.l}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-[#ffffff] text-[#000000] border-[#ffffff]'
                              : 'bg-[#000000] text-[#ffffff] border-[#3a3a3f] hover:border-[#ffffff]'
                          }`}
                        >
                          <Recycle className="w-4 h-4" />
                        </div>

                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#000000] border border-[#3a3a3f] text-[#ffffff] text-[10px] font-mono px-2 py-1 whitespace-nowrap pointer-events-none z-30">
                          {r.name}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="absolute bottom-3 left-3 bg-[#000000] border border-[#3a3a3f] px-3 py-1 text-[10px] text-[#5a5a5f] font-mono">
                TELEMETRY GRID // CLICK ANY VECTOR PIN
              </div>
            </div>
          </div>

          {/* DETAILS DRAWER (4 COLS) */}
          <div className="lg:col-span-4 border border-[#3a3a3f] bg-[#000000] p-6 space-y-6">
            {selectedLocation ? (
              <>
                <div className="border-b border-[#3a3a3f] pb-4">
                  <span className="spacex-caption">
                    {selectedLocation.cpcbRegistrationNo ? '// CPCB AUTHORISED RECYCLER' : '// CAMPUS COLLECTION DEPOT'}
                  </span>
                  <h3 className="font-['D-DIN-Bold'] text-xl uppercase tracking-wider text-[#ffffff] mt-1">
                    {selectedLocation.name}
                  </h3>
                </div>

                {!selectedLocation.cpcbRegistrationNo ? (
                  <div className="space-y-4 text-xs font-mono">
                    <div>
                      <span className="spacex-caption block mb-1">LOCATION VECTOR:</span>
                      <p className="text-[#ffffff]">{selectedLocation.locationDesc}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border border-[#3a3a3f] p-4 bg-[#0a0a0a]">
                      <div>
                        <span className="spacex-caption block">DISTANCE</span>
                        <span className="font-['D-DIN-Bold'] text-xl text-[#ffffff] mt-1 block">
                          {selectedLocation.distanceMeters !== undefined ? `${selectedLocation.distanceMeters} M` : 'NEAR'}
                        </span>
                      </div>
                      <div>
                        <span className="spacex-caption block">WALKING</span>
                        <span className="font-['D-DIN-Bold'] text-xl text-[#ffffff] mt-1 block">
                          ~{selectedLocation.estimatedWalkingMinutes || 1} MIN
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="spacex-caption block mb-1">HOURS &amp; CUSTODIAN:</span>
                      <p className="text-[#f0f0fa]">{selectedLocation.operatingHours}</p>
                      <p className="text-[#5a5a5f] mt-1">{selectedLocation.contactPhone} ({selectedLocation.custodian})</p>
                    </div>

                    <div>
                      <span className="spacex-caption block mb-2">ACCEPTED STREAMS:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedLocation.acceptedTypes?.map((t, i) => (
                          <span
                            key={i}
                            className="text-[10px] border border-[#3a3a3f] text-[#f0f0fa] px-2 py-0.5 uppercase"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs font-mono">
                    <div>
                      <span className="spacex-caption block mb-1">OPERATOR:</span>
                      <p className="text-[#ffffff] font-bold">{selectedLocation.recyclerName}</p>
                    </div>

                    <div className="border border-[#3a3a3f] p-4 bg-[#0a0a0a] space-y-1">
                      <div className="spacex-caption">CPCB REGISTRATION:</div>
                      <div className="text-sm font-bold text-[#ffffff]">{selectedLocation.cpcbRegistrationNo}</div>
                      <div className="text-[10px] text-[#5a5a5f]">STATE: {selectedLocation.spcbAuthNo}</div>
                    </div>

                    <div>
                      <span className="spacex-caption block mb-1">FACILITY ADDRESS:</span>
                      <p className="text-[#f0f0fa]">{selectedLocation.address}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border border-[#3a3a3f] p-4 bg-[#0a0a0a]">
                      <div>
                        <span className="spacex-caption block">DISTANCE</span>
                        <span className="font-['D-DIN-Bold'] text-xl text-[#ffffff] mt-1 block">
                          {selectedLocation.distanceFromCampusKm} KM
                        </span>
                      </div>
                      <div>
                        <span className="spacex-caption block">ANNUAL CAPACITY</span>
                        <span className="font-['D-DIN-Bold'] text-xl text-[#ffffff] mt-1 block">
                          {selectedLocation.authorizedCapacityMT} MT
                        </span>
                      </div>
                    </div>

                    <a
                      href={selectedLocation.cpcbEprPortalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-spacex w-full text-center"
                    >
                      <span>VERIFY ON CPCB EPR &rarr;</span>
                    </a>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 spacex-caption">
                SELECT A VECTOR PIN ON THE MAP TO INSPECT TELEMETRY.
              </div>
            )}
          </div>
        </div>

        {/* MASTER DIRECTORY TABLE */}
        <section className="space-y-6 border-t border-[#3a3a3f] pt-12">
          <div className="border-b border-[#3a3a3f] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider">
                {viewMode === 'recyclers' ? 'CPCB-AUTHORISED RECYCLERS MANIFEST' : 'CAMPUS COLLECTION POINTS DIRECTORY'}
              </h3>
              <span className="spacex-caption">NMAMIT CAMPUS NITTE &amp; CPCB REGISTER</span>
            </div>
            <div className="spacex-caption">
              REFERENCE: {mapData?.referenceLocation?.name || 'NANDANI HOSTEL'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>LOCATION / FACILITY</th>
                  <th>CATEGORY</th>
                  <th>GPS COORDINATES</th>
                  <th>PROXIMITY / DISTANCE</th>
                  <th>HOURS / CAPACITY</th>
                  <th>CUSTODIAN</th>
                  <th className="text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {viewMode !== 'recyclers' &&
                  campusPoints.map((cp) => (
                    <tr key={cp.id}>
                      <td className="font-['D-DIN-Bold'] text-sm uppercase text-[#ffffff]">
                        {cp.name}
                        {nearest?.id === cp.id && (
                          <span className="ml-2 text-[10px] border border-[#ffffff] text-[#000000] bg-[#ffffff] px-1.5 py-0.2 uppercase font-['D-DIN-Bold']">
                            NEAREST
                          </span>
                        )}
                      </td>
                      <td className="text-xs uppercase font-mono text-[#5a5a5f]">{cp.category}</td>
                      <td className="font-mono text-xs text-[#5a5a5f]">
                        {cp.lat.toFixed(4)}°N, {cp.lng.toFixed(4)}°E
                      </td>
                      <td className="font-mono font-bold text-[#ffffff]">
                        {cp.distanceMeters !== undefined ? `${cp.distanceMeters} M` : 'NEAR'}
                      </td>
                      <td className="text-xs font-mono text-[#5a5a5f]">{cp.operatingHours}</td>
                      <td className="text-xs font-mono text-[#f0f0fa]">{cp.custodian}</td>
                      <td className="text-right">
                        <button
                          onClick={() => setSelectedLocation(cp)}
                          className="btn-spacex py-1 px-3 text-[11px]"
                        >
                          SELECT
                        </button>
                      </td>
                    </tr>
                  ))}

                {viewMode !== 'campus' &&
                  recyclers.map((r) => (
                    <tr key={r.id}>
                      <td className="font-['D-DIN-Bold'] text-sm uppercase text-[#ffffff]">
                        <div>{r.name}</div>
                        <div className="text-[10px] text-[#5a5a5f] font-mono">{r.cpcbRegistrationNo}</div>
                      </td>
                      <td className="text-xs uppercase font-mono text-[#5a5a5f]">{r.city}</td>
                      <td className="font-mono text-xs text-[#5a5a5f]">
                        {r.lat.toFixed(4)}°N, {r.lng.toFixed(4)}°E
                      </td>
                      <td className="font-mono font-bold text-[#ffffff]">{r.distanceFromCampusKm} KM</td>
                      <td className="text-xs font-mono text-[#5a5a5f]">{r.authorizedCapacityMT} MT / YR</td>
                      <td className="text-xs font-mono text-[#f0f0fa]">{r.recyclerName}</td>
                      <td className="text-right">
                        <button
                          onClick={() => setSelectedLocation(r)}
                          className="btn-spacex py-1 px-3 text-[11px]"
                        >
                          SELECT
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

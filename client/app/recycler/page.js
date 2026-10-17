'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  Recycle,
  QrCode,
  Camera,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  Building,
  Scale,
  ArrowLeft,
  ArrowRight,
  LogOut,
  Award,
  Printer,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { formatHostel } from '@/lib/formatHostel';
import CertificateModal from '@/components/CertificateModal';

const FACILITIES = [
  'Janavi Bairoliya - Netravati Material Recovery Plant',
  'EcoReclaim Certified Dismantling & Material Recovery (Unit 4)',
  'GreenTech State Authorized Recycling Plant #2',
  'Campus CleanTech E-Waste Processing Facility',
];

export default function RecyclerPage() {
  const { user, logout } = useAuth();

  const [activeMode, setActiveMode] = useState('camera');
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);

  const [scannedItem, setScannedItem] = useState(null);
  const [selectedCertItem, setSelectedCertItem] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('inbound');

  const [facility, setFacility] = useState(FACILITIES[0]);
  const [notes, setNotes] = useState('Certified safe green dismantling completed. Hazardous materials isolated, precious metals extracted.');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const html5QrCodeRef = useRef(null);

  const fetchItems = () => {
    api
      .getItems()
      .then((res) => {
        if (res.success && res.items) {
          setAvailableItems(res.items);
        }
      })
      .catch((e) => console.warn('Could not fetch items:', e));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (activeMode === 'camera' && !scannedItem) {
      const startScanner = async () => {
        try {
          const { Html5Qrcode } = await import('html5-qrcode');
          const targetEl = document.getElementById('recycler-camera-viewport');
          if (!targetEl) return;

          if (html5QrCodeRef.current) {
            try {
              await html5QrCodeRef.current.stop();
            } catch (e) {}
          }

          const qrScanner = new Html5Qrcode('recycler-camera-viewport');
          html5QrCodeRef.current = qrScanner;

          setIsScanning(true);
          setCameraError('');

          await qrScanner.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 240, height: 240 },
            },
            (decodedText) => {
              if (isMounted) {
                handleScannedData(decodedText);
              }
            },
            () => {}
          );
        } catch (err) {
          if (isMounted) {
            setCameraError('Camera optical feed unattached. Use serialized code input.');
            setIsScanning(false);
          }
        }
      };

      const timer = setTimeout(startScanner, 200);
      return () => {
        isMounted = false;
        clearTimeout(timer);
        if (html5QrCodeRef.current) {
          html5QrCodeRef.current.stop().catch(() => {});
        }
      };
    }
  }, [activeMode, scannedItem]);

  const handleScannedData = async (code) => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {}
      setIsScanning(false);
    }

    setLookupLoading(true);
    setError('');

    try {
      const res = await api.scanLookup(code);
      if (res.success && res.item) {
        setScannedItem(res.item);
      } else {
        setError(res.message || 'SCANNED TELEMETRY CODE DOES NOT MATCH ANY ENROLLED ASSET.');
      }
    } catch (err) {
      setError(err.message || 'ERROR PROCESSING OPTICAL TELEMETRY.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLookupLoading(true);
    setError('');

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const tempScanner = new Html5Qrcode('recycler-file-temp');
      const decoded = await tempScanner.scanFile(file, true);
      tempScanner.clear();
      await handleScannedData(decoded);
    } catch (err) {
      setError('COULD NOT DECODE QR CODE FROM UPLOADED IMAGE.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleManualLookup = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScannedData(manualCode.trim());
    }
  };

  const handleMarkRecycled = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);

    try {
      const res = await api.recycleItem(scannedItem._id || scannedItem.id, {
        facility,
        notes,
      });

      if (res.success && res.item) {
        setScannedItem(res.item);
        setSelectedCertItem(res.item);
        setSubmitSuccess(true);
        fetchItems();
      } else {
        setError(res.message || 'FAILED TO UPDATE RECYCLING VERIFICATION');
      }
    } catch (err) {
      setError(err.message || 'SERVER ERROR VERIFYING RECYCLING');
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetScanner = () => {
    setScannedItem(null);
    setSubmitSuccess(false);
    setError('');
    setActiveMode('camera');
  };

  const itemsAwaitingRecycling = availableItems.filter(
    (i) => i.status === 'handed_over' || i.status === 'collected'
  );

  const certifiedRecycledItems = availableItems.filter(
    (i) => i.status === 'verified_recycled'
  );

  return (
    <div className="min-h-screen bg-[#000000] text-[#f0f0fa] flex flex-col font-sans">
      <div id="recycler-file-temp" className="hidden" />

      {/* Top Header */}
      <header className="bg-[#000000] py-4 px-6 border-b border-[#3a3a3f] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
          <div className="flex items-center gap-4">
            <span className="spacex-caption">// AUTHORISED RECYCLER FACILITY PORTAL</span>
            {logout && (
              <button
                onClick={logout}
                className="text-[#5a5a5f] hover:text-[#ffffff] text-xs font-bold uppercase transition"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b border-[#3a3a3f] px-6 py-12 bg-[#000000]">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="spacex-caption">// TERMINAL DISMANTLING &amp; EXTRACTION</div>
          <h1 className="font-['D-DIN-Bold'] text-4xl sm:text-6xl font-black text-[#ffffff] uppercase tracking-tight leading-[0.95]">
            RECYCLER RECOVERY CONSOLE
          </h1>
          <p className="text-base text-[#f0f0fa] max-w-2xl leading-relaxed">
            Scan arriving campus consignments, record material extraction parameters, and issue verifiable CPCB recycling certificates with instant PDF downloads.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 space-y-12 w-full">
        {!scannedItem ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Scanner (7 cols) */}
            <div className="lg:col-span-7 border border-[#3a3a3f] bg-[#000000] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-4">
                <div className="flex items-center gap-2">
                  {['camera', 'upload', 'manual'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setActiveMode(mode)}
                      className={`px-3 py-1.5 uppercase font-mono text-[11px] rounded-full border transition-all ${
                        activeMode === mode
                          ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                          : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff]'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <span className="spacex-caption text-[10px]">OPTICAL SENSOR</span>
              </div>

              {error && (
                <div className="p-3 border border-[#ffffff] text-[#ffffff] text-xs font-mono">
                  {error}
                </div>
              )}

              {activeMode === 'camera' && (
                <div className="space-y-4">
                  {cameraError ? (
                    <div className="p-6 border border-[#3a3a3f] bg-[#0a0a0a] text-center space-y-3 font-mono text-xs text-[#5a5a5f]">
                      <p>{cameraError}</p>
                      <button onClick={() => setActiveMode('manual')} className="btn-spacex">
                        SWITCH TO MANUAL LOOKUP
                      </button>
                    </div>
                  ) : (
                    <div className="border border-[#3a3a3f] bg-[#0a0a0a] relative overflow-hidden">
                      <div id="recycler-camera-viewport" className="w-full min-h-[280px]" />
                      <div className="p-2 border-t border-[#3a3a3f] text-center spacex-caption text-[10px]">
                        POSITION QR PASSPORT WITHIN FRAME
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeMode === 'upload' && (
                <div className="border border-dashed border-[#3a3a3f] hover:border-[#ffffff] p-12 text-center transition-colors">
                  <label className="cursor-pointer block space-y-2">
                    <span className="font-['D-DIN-Bold'] text-sm uppercase text-[#ffffff]">UPLOAD QR IMAGE</span>
                    <span className="spacex-caption block text-[10px]">PNG, JPG, WEBP ACCEPTED</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              )}

              {activeMode === 'manual' && (
                <form onSubmit={handleManualLookup} className="space-y-4 font-mono text-xs">
                  <div>
                    <label className="spacex-caption block mb-1">INPUT SERIALIZED TRACKING CODE</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="ECO-2026-XXXX"
                        className="flex-1 px-3 py-2.5 bg-[#0a0a0a] border border-[#3a3a3f] text-[#ffffff]"
                      />
                      <button type="submit" disabled={lookupLoading} className="btn-spacex">
                        <span>LOOKUP</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Right: Consignments Sidebar with Tabbed View (5 cols) */}
            <div className="lg:col-span-5 border border-[#3a3a3f] bg-[#000000] p-6 space-y-4">
              {/* Tab Header */}
              <div className="grid grid-cols-2 border-b border-[#3a3a3f] text-xs font-['D-DIN-Bold'] uppercase">
                <button
                  type="button"
                  onClick={() => setSidebarTab('inbound')}
                  className={`pb-3 border-b-2 transition-colors ${
                    sidebarTab === 'inbound'
                      ? 'border-[#ffffff] text-[#ffffff]'
                      : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff]'
                  }`}
                >
                  In Transit ({itemsAwaitingRecycling.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab('certified')}
                  className={`pb-3 border-b-2 transition-colors ${
                    sidebarTab === 'certified'
                      ? 'border-emerald-400 text-emerald-400'
                      : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff]'
                  }`}
                >
                  Certified ({certifiedRecycledItems.length})
                </button>
              </div>

              {sidebarTab === 'inbound' ? (
                <div className="space-y-2 max-h-[380px] overflow-y-auto font-mono text-xs">
                  {itemsAwaitingRecycling.length === 0 ? (
                    <p className="spacex-caption py-8 text-center">NO INBOUND CONSIGNMENTS PENDING.</p>
                  ) : (
                    itemsAwaitingRecycling.map((item) => (
                      <button
                        key={item._id || item.trackingCode}
                        onClick={() => handleScannedData(item.trackingCode)}
                        className="w-full text-left p-3 border border-[#3a3a3f] hover:border-[#ffffff] bg-[#0a0a0a] transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-[#ffffff]">{item.trackingCode}</div>
                          <div className="text-[11px] text-[#5a5a5f] uppercase mt-0.5">
                            {item.type} • {item.actualWeight || item.approxWeight} KG
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#5a5a5f]" />
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto font-mono text-xs">
                  {certifiedRecycledItems.length === 0 ? (
                    <p className="spacex-caption py-8 text-center">NO CERTIFIED ITEMS YET.</p>
                  ) : (
                    certifiedRecycledItems.map((item) => (
                      <div
                        key={item._id || item.trackingCode}
                        className="p-3 border border-emerald-500/40 bg-[#0a0a0a] flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-[#ffffff] flex items-center gap-1.5">
                            <span>{item.trackingCode}</span>
                            <span className="text-[10px] text-emerald-400 font-normal">✓ CERTIFIED</span>
                          </div>
                          <div className="text-[11px] text-[#8a8a93] uppercase mt-0.5">
                            {item.userName} • {item.type} ({item.actualWeight || item.approxWeight} KG)
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedCertItem(item);
                            setIsCertModalOpen(true);
                          }}
                          className="btn-spacex py-1 px-2.5 text-[11px] border-emerald-400 text-emerald-300 hover:bg-emerald-500/20"
                          title="Download Official Certificate"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Certificate</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Scanned Item Verification View */
          <div className="border border-[#ffffff] bg-[#0a0a0a] p-8 space-y-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-4">
              <div>
                <span className="spacex-caption">// ASSET TELEMETRY: {scannedItem.trackingCode}</span>
                <h2 className="font-['D-DIN-Bold'] text-2xl uppercase text-[#ffffff] mt-1">
                  VERIFY RECYCLING COMPLETION
                </h2>
              </div>
              <button onClick={resetScanner} className="btn-spacex btn-spacex-muted py-1.5 px-3 text-xs">
                <span>SCAN ANOTHER</span>
              </button>
            </div>

            {submitSuccess ? (
              <div className="space-y-6 font-mono text-xs">
                {/* Official Certificate Generated Card */}
                <div className="border-2 border-emerald-500 bg-[#001408] p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-400 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <Award className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold tracking-[2px] text-emerald-400 uppercase block mb-1">
                      // CPCB STATUTORY EPR DESTRUCTION ATTESTATION
                    </span>
                    <h3 className="font-['D-DIN-Bold'] text-2xl uppercase text-[#ffffff]">
                      RECYCLING CERTIFICATE SUCCESSFULLY ISSUED
                    </h3>
                    <p className="text-[#a1a1aa] text-xs mt-1">
                      CPCB Green Recycling Certificate generated for unit <strong className="text-[#ffffff]">{scannedItem.trackingCode}</strong>.
                    </p>
                  </div>

                  {/* Primary Certificate Download Action Button */}
                  <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedCertItem(scannedItem);
                        setIsCertModalOpen(true);
                      }}
                      className="btn-spacex py-3 px-6 bg-emerald-500 text-black hover:bg-emerald-400 font-bold text-sm tracking-wider flex items-center justify-center gap-2"
                    >
                      <Award className="w-4 h-4" />
                      <span>VIEW &amp; DOWNLOAD OFFICIAL CERTIFICATE (PDF)</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => {
                      setSelectedCertItem(scannedItem);
                      setIsCertModalOpen(true);
                    }}
                    className="btn-spacex-muted btn-spacex py-2 text-xs"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1" />
                    <span>Print Certificate</span>
                  </button>

                  <button onClick={resetScanner} className="btn-spacex py-2 px-6">
                    <span>DISPATCH ANOTHER CONSIGNMENT</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleMarkRecycled} className="space-y-6 font-mono text-xs">
                <div className="grid grid-cols-2 gap-4 border border-[#3a3a3f] p-4 bg-[#000000]">
                  <div>
                    <span className="spacex-caption block">CATEGORY:</span>
                    <span className="font-bold text-[#ffffff] text-sm uppercase mt-0.5 block">{scannedItem.type}</span>
                  </div>
                  <div>
                    <span className="spacex-caption block">CERTIFIED MASS:</span>
                    <span className="font-bold text-[#ffffff] text-sm mt-0.5 block">{scannedItem.actualWeight || scannedItem.approxWeight} KG</span>
                  </div>
                </div>

                <div>
                  <label className="spacex-caption block mb-1">CERTIFIED DISMANTLING FACILITY</label>
                  <select
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#000000] border border-[#3a3a3f] text-[#ffffff]"
                  >
                    {FACILITIES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="spacex-caption block mb-1">SAFE MATERIAL EXTRACTION LOG</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#000000] border border-[#3a3a3f] text-[#f0f0fa]"
                  />
                </div>

                <button type="submit" disabled={submitLoading} className="btn-spacex w-full py-3 bg-[#ffffff] text-[#000000] hover:bg-[#e0e0e0] font-bold text-sm">
                  <Award className="w-4 h-4 mr-2" />
                  <span>{submitLoading ? 'ISSUING CERTIFICATE...' : 'ISSUE CPCB GREEN CERTIFICATE'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </main>

      {/* Certificate Viewer & Download Modal */}
      <CertificateModal
        item={selectedCertItem || scannedItem}
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        facilityName={facility}
      />
    </div>
  );
}

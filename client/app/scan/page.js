'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  QrCode,
  Camera,
  Upload,
  Search,
  Scale,
  ArrowLeft,
  Check,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatHostel, formatLocation } from '@/lib/formatHostel';

export default function ScanQrPage() {
  const { user, logout } = useAuth();

  const [activeMode, setActiveMode] = useState('camera');
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);

  const [scannedItem, setScannedItem] = useState(null);
  const [scannedHandovers, setScannedHandovers] = useState([]);

  const [actualWeight, setActualWeight] = useState('');
  const [collectionLocation, setCollectionLocation] = useState('Station Nandani Reception');
  const [notes, setNotes] = useState('Weighed on digital scale by collection team');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [awardedPoints, setAwardedPoints] = useState(0);
  const [error, setError] = useState('');

  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    api
      .getItems()
      .then((res) => {
        if (res.success && res.items) {
          setAvailableItems(res.items);
        }
      })
      .catch((e) => console.warn('Could not fetch items:', e));
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (activeMode === 'camera' && !scannedItem) {
      const startScanner = async () => {
        try {
          const { Html5Qrcode } = await import('html5-qrcode');

          const targetEl = document.getElementById('camera-reader-viewport');
          if (!targetEl) return;

          if (html5QrCodeRef.current) {
            try {
              await html5QrCodeRef.current.stop();
            } catch (e) {}
          }

          const qrScanner = new Html5Qrcode('camera-reader-viewport');
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
                handleScannedCode(decodedText);
              }
            },
            () => {}
          );
        } catch (err) {
          if (isMounted) {
            setCameraError('Camera optical sensor unavailable. Use manual code lookup below.');
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

  const handleScannedCode = async (code) => {
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
        setScannedHandovers(res.handovers || []);
        setActualWeight(res.item.actualWeight || res.item.approxWeight || '1.0');
        if (res.item.location) {
          setCollectionLocation(res.item.location);
        }
      } else {
        setError(res.message || 'Tracking ID not found in master ledger.');
      }
    } catch (err) {
      setError(err.message || 'Lookup failed.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleManualLookup = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScannedCode(manualCode.trim());
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLookupLoading(true);
    setError('');

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const qrScanner = new Html5Qrcode('file-qr-temp');
      const decodedText = await qrScanner.scanFile(file, true);
      await handleScannedCode(decodedText);
    } catch (err) {
      setError('Could not decode QR image. Ensure the image is focused and high contrast.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleMarkCollected = async (e) => {
    e.preventDefault();
    if (!scannedItem) return;

    const weightNum = parseFloat(actualWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setError('Enter a calibrated positive mass in kg.');
      return;
    }

    setSubmitLoading(true);
    setError('');

    try {
      const res = await api.collectItem(scannedItem._id || scannedItem.id, {
        actualWeight: weightNum,
        location: collectionLocation,
        notes,
      });

      if (res.success) {
        setSubmitSuccess(true);
        setAwardedPoints(res.pointsAwarded || Math.round(weightNum * 10));
        confetti({ particleCount: 30, spread: 40 });
      } else {
        setError(res.message || 'Failed to record collection in database.');
      }
    } catch (err) {
      setError(err.message || 'Error executing collection handshake.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetScanner = () => {
    setScannedItem(null);
    setScannedHandovers([]);
    setSubmitSuccess(false);
    setActualWeight('');
    setError('');
  };

  const calculatedPoints = Math.round((parseFloat(actualWeight) || 0) * 10);

  return (
    <div className="min-h-screen bg-[#000000] text-[#f0f0fa] flex flex-col font-sans">
      <div id="file-qr-temp" className="hidden" />

      {/* Top Telemetry Strip */}
      <div className="bg-[#000000] border-b border-[#3a3a3f] px-6 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffffff] inline-block" />
            <span className="spacex-caption">// OPERATOR:</span>
            <span className="font-mono text-xs text-[#ffffff]">
              {user?.name || 'COLLECTION SQUAD'} [{user?.role?.toUpperCase() || 'COLLECTOR'}]
            </span>
          </div>

          <button
            onClick={logout}
            className="text-[#5a5a5f] hover:text-[#ffffff] text-[11px] font-bold uppercase tracking-[1.17px] transition-colors cursor-pointer bg-transparent border-0"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Command Bar */}
      <header className="border-b border-[#3a3a3f] px-6 py-4 bg-[#000000]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-['D-DIN-Bold'] text-2xl tracking-[3px] text-[#ffffff] uppercase">
              ECOLOOP
            </span>
            <span className="text-[#3a3a3f]">/</span>
            <span className="spacex-caption">OPTICAL QR SCANNER</span>
          </div>

          <button
            onClick={() => (window.history.length > 1 ? window.history.back() : (window.location.href = '/'))}
            className="btn-spacex"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>
      </header>

      {/* Main Scanner Section */}
      <main className="max-w-4xl mx-auto px-6 py-12 w-full flex-1">
        {/* Banner */}
        <div className="border-b border-[#3a3a3f] pb-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="spacex-caption mb-2">// OPTICAL RECOVERY SENSOR</div>
            <h1 className="font-['D-DIN-Bold'] text-4xl sm:text-5xl font-black text-[#ffffff] uppercase tracking-tight">
              SCAN QR &amp; CALIBRATE MASS
            </h1>
            <p className="text-[#5a5a5f] text-sm mt-2 max-w-lg">
              Decode digital e-waste passport stickers, input certified scale weight, and record physical custody.
            </p>
          </div>

          <div className="border border-[#3a3a3f] p-4 bg-[#0a0a0a] shrink-0 text-right">
            <div className="spacex-caption">CONVERSION FACTOR</div>
            <div className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] mt-1">10 PTS / KG</div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 border border-[#3a3a3f] bg-[#0a0a0a] text-xs font-mono text-[#ffffff]">
            // ERROR: {error}
          </div>
        )}

        {!scannedItem ? (
          <div className="border border-[#3a3a3f] bg-[#0a0a0a]">
            {/* Mode Switcher */}
            <div className="grid grid-cols-3 border-b border-[#3a3a3f] text-xs font-['D-DIN-Bold'] uppercase tracking-[1.17px]">
              <button
                type="button"
                onClick={() => setActiveMode('camera')}
                className={`py-3.5 text-center cursor-pointer border-0 ${
                  activeMode === 'camera'
                    ? 'bg-[#ffffff] text-[#000000]'
                    : 'bg-transparent text-[#5a5a5f] hover:text-[#ffffff]'
                }`}
              >
                01 // Camera View
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('upload')}
                className={`py-3.5 text-center cursor-pointer border-0 ${
                  activeMode === 'upload'
                    ? 'bg-[#ffffff] text-[#000000]'
                    : 'bg-transparent text-[#5a5a5f] hover:text-[#ffffff]'
                }`}
              >
                02 // Upload Image
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('manual')}
                className={`py-3.5 text-center cursor-pointer border-0 ${
                  activeMode === 'manual'
                    ? 'bg-[#ffffff] text-[#000000]'
                    : 'bg-transparent text-[#5a5a5f] hover:text-[#ffffff]'
                }`}
              >
                03 // Code / Presets
              </button>
            </div>

            <div className="p-8">
              {lookupLoading ? (
                <div className="py-16 text-center space-y-3">
                  <div className="spacex-caption animate-pulse">DECODING DIGITAL PASSPORT CRYPTOGRAM...</div>
                </div>
              ) : (
                <>
                  {activeMode === 'camera' && (
                    <div className="flex flex-col items-center">
                      {cameraError ? (
                        <div className="border border-[#3a3a3f] p-6 text-center space-y-4 max-w-md w-full">
                          <p className="spacex-caption">{cameraError}</p>
                          <button
                            onClick={() => setActiveMode('manual')}
                            className="btn-spacex"
                          >
                            Use Manual Code Lookup
                          </button>
                        </div>
                      ) : (
                        <div className="w-full max-w-md">
                          <div className="border border-[#3a3a3f] p-1 bg-[#000000]">
                            <div id="camera-reader-viewport" className="w-full min-h-[300px]" />
                          </div>
                          <div className="spacex-caption text-center mt-3">
                            ALIGN QR PASSPORT CODE WITHIN VIEWFINDER
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeMode === 'upload' && (
                    <div className="max-w-md mx-auto text-center space-y-4">
                      <label className="border border-dashed border-[#3a3a3f] hover:border-[#ffffff] p-12 flex flex-col items-center justify-center cursor-pointer bg-[#000000] transition-colors">
                        <Upload className="w-8 h-8 text-[#ffffff] mb-3" />
                        <span className="font-['D-DIN-Bold'] text-sm uppercase text-[#ffffff]">Select QR Tag Image</span>
                        <span className="spacex-caption mt-1">PNG, JPG, WEBP</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  )}

                  {(activeMode === 'manual' || cameraError) && (
                    <div className="max-w-md mx-auto space-y-6">
                      <form onSubmit={handleManualLookup} className="space-y-3">
                        <label className="block spacex-caption">ENTER TRACKING CODE</label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            placeholder="ECO-2026-XXXX"
                            className="flex-1 px-4 py-3 font-mono text-sm uppercase"
                          />
                          <button
                            type="submit"
                            disabled={!manualCode.trim()}
                            className="btn-spacex"
                          >
                            Query
                          </button>
                        </div>
                      </form>

                      {availableItems.length > 0 && (
                        <div className="border-t border-[#3a3a3f] pt-4">
                          <div className="spacex-caption mb-3">// RECENT UNCOLLECTED HARDWARE PRESETS:</div>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {availableItems.slice(0, 5).map((item) => (
                              <div
                                key={item._id || item.trackingCode}
                                onClick={() => handleScannedCode(item.trackingCode)}
                                className="p-3 border border-[#3a3a3f] hover:border-[#ffffff] bg-[#000000] flex justify-between items-center cursor-pointer text-xs"
                              >
                                <span className="font-mono text-[#ffffff]">{item.trackingCode}</span>
                                <span className="text-[#5a5a5f]">{item.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : submitSuccess ? (
          <div className="border border-[#3a3a3f] bg-[#0a0a0a] p-12 text-center space-y-6">
            <div className="spacex-caption">// STATUS: VERIFIED AND RECORDED</div>
            <h2 className="font-['D-DIN-Bold'] text-4xl text-[#ffffff] uppercase">
              CUSTODY HANDSHAKE COMPLETE
            </h2>
            <p className="text-[#5a5a5f] text-sm max-w-md mx-auto">
              Hardware marked as collected. Digital scale mass recorded. {awardedPoints} reward points transferred to operator ledger.
            </p>

            <div className="flex justify-center gap-4 pt-4">
              <button onClick={resetScanner} className="btn-spacex">
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan Next Unit</span>
              </button>
              <Link href="/" className="btn-spacex-muted btn-spacex">
                <span>Return to Overview</span>
              </Link>
            </div>
          </div>
        ) : (
          /* DETAILS & WEIGHT INPUT */
          <div className="border border-[#3a3a3f] bg-[#0a0a0a] p-8 space-y-8">
            <div className="border-b border-[#3a3a3f] pb-6">
              <div className="spacex-caption mb-1">// DIGITAL PASSPORT VERIFIED</div>
              <h3 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase">
                {scannedItem.type}
              </h3>
              <div className="font-mono text-sm text-[#5a5a5f] mt-1">{scannedItem.trackingCode}</div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs border-b border-[#3a3a3f] pb-6">
              <div>
                <span className="spacex-caption">STUDENT / OPERATOR:</span>
                <div className="font-semibold text-[#ffffff] mt-1">{scannedItem.userName}</div>
              </div>
              <div>
                <span className="spacex-caption">ORIGIN STATION:</span>
                <div className="font-semibold text-[#ffffff] mt-1">{formatLocation(scannedItem.location, scannedItem.userHostel)}</div>
              </div>
              <div>
                <span className="spacex-caption">ESTIMATED MASS:</span>
                <div className="font-mono text-[#ffffff] mt-1">{scannedItem.approxWeight} KG</div>
              </div>
              <div>
                <span className="spacex-caption">STATUS:</span>
                <div className="font-mono uppercase text-[#ffffff] mt-1">[{scannedItem.status}]</div>
              </div>
            </div>

            <form onSubmit={handleMarkCollected} className="space-y-6">
              <div>
                <label className="block spacex-caption mb-2">CALIBRATED DIGITAL MASS (KG)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    required
                    value={actualWeight}
                    onChange={(e) => setActualWeight(e.target.value)}
                    placeholder="2.5"
                    className="w-full px-4 py-3 font-mono text-xl text-[#ffffff]"
                  />
                </div>
              </div>

              <div className="border border-[#3a3a3f] p-4 bg-[#000000] flex justify-between items-center text-xs">
                <span className="spacex-caption">COMPUTED REWARD TRANSFER:</span>
                <span className="font-['D-DIN-Bold'] text-xl text-[#ffffff]">+{calculatedPoints} PTS</span>
              </div>

              <div>
                <label className="block spacex-caption mb-2">COLLECTION DEPOT / RECEPTION BAY</label>
                <input
                  type="text"
                  required
                  value={collectionLocation}
                  onChange={(e) => setCollectionLocation(e.target.value)}
                  className="w-full px-4 py-3 text-sm"
                />
              </div>

              <div className="pt-4 border-t border-[#3a3a3f] flex items-center justify-between">
                <button
                  type="button"
                  onClick={resetScanner}
                  className="btn-spacex-muted btn-spacex"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitLoading || parseFloat(actualWeight) <= 0}
                  className="btn-spacex px-8 py-3"
                >
                  {submitLoading ? 'SAVING...' : 'CONFIRM PHYSICAL CUSTODY'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import {
  X,
  Camera,
  Upload,
  Search,
  AlertCircle,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { formatHostel } from '@/lib/formatHostel';

export default function QrScannerModal({ isOpen, onClose, onScanSuccess, availableItems = [] }) {
  const [activeMode, setActiveMode] = useState('camera'); // 'camera' | 'upload' | 'manual'
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const html5QrCodeInstance = useRef(null);

  useEffect(() => {
    let isMounted = true;

    if (isOpen && activeMode === 'camera') {
      const initCamera = async () => {
        try {
          const { Html5Qrcode } = await import('html5-qrcode');

          if (!document.getElementById('qr-reader-container')) return;

          if (html5QrCodeInstance.current) {
            try {
              await html5QrCodeInstance.current.stop();
            } catch (e) {
              // ignore
            }
          }

          const qrScanner = new Html5Qrcode('qr-reader-container');
          html5QrCodeInstance.current = qrScanner;

          setIsScanning(true);
          setCameraError('');

          await qrScanner.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 220, height: 220 },
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
            console.warn('Camera scanner start warning:', err);
            setCameraError(
              'OPTICAL SENSOR UNAVAILABLE OR PERMISSION BLOCKED. SWITCHING TO MANUAL INPUT.'
            );
            setActiveMode('manual');
          }
        }
      };

      initCamera();
    }

    return () => {
      isMounted = false;
      if (html5QrCodeInstance.current) {
        try {
          html5QrCodeInstance.current.stop().catch(() => {});
        } catch (e) {}
      }
    };
  }, [isOpen, activeMode]);

  if (!isOpen) return null;

  const handleScannedCode = async (codeText) => {
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      if (html5QrCodeInstance.current && isScanning) {
        try {
          await html5QrCodeInstance.current.stop();
        } catch (e) {}
      }

      const res = await api.scanLookup(codeText);
      if (res.success && res.item) {
        onScanSuccess(res.item);
        onClose();
      } else {
        setError(res.message || 'SCANNED TELEMETRY TAG DOES NOT MATCH ANY REGISTERED ASSET.');
      }
    } catch (err) {
      setError(err.message || 'ERROR PROCESSING OPTICAL QR DATA.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const tempScanner = new Html5Qrcode('file-scan-temp-target');
      const decoded = await tempScanner.scanFile(file, true);
      tempScanner.clear();
      await handleScannedCode(decoded);
    } catch (err) {
      setError('COULD NOT DECODE QR FROM UPLOADED IMAGE. PLEASE RETRY OR USE MANUAL CODE.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScannedCode(manualCode.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#0a0a0a] border border-[#3a3a3f] max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="border-b border-[#3a3a3f] p-6 flex items-center justify-between shrink-0 bg-[#000000]">
          <div>
            <div className="spacex-caption">// OPTICAL SCANNER INTERFACE</div>
            <h2 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider mt-1 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#ffffff]" />
              SCAN HARDWARE PASSPORT
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#5a5a5f] hover:text-[#ffffff] transition-colors p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 border-b border-[#3a3a3f] bg-[#000000] p-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveMode('camera')}
            className={`py-2 px-3 uppercase font-['D-DIN-Bold'] tracking-wider rounded-full border transition-all ${
              activeMode === 'camera'
                ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff]'
            }`}
          >
            Camera
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`py-2 px-3 uppercase font-['D-DIN-Bold'] tracking-wider rounded-full border transition-all ${
              activeMode === 'upload'
                ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff]'
            }`}
          >
            Image File
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('manual')}
            className={`py-2 px-3 uppercase font-['D-DIN-Bold'] tracking-wider rounded-full border transition-all ${
              activeMode === 'manual'
                ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff]'
            }`}
          >
            Code Lookup
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 border border-[#ffffff] text-[#ffffff] text-xs flex items-center gap-2 bg-[#000000]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-mono">{error}</span>
            </div>
          )}

          {/* Hidden helper for file scanner */}
          <div id="file-scan-temp-target" className="hidden" />

          {/* CAMERA MODE */}
          {activeMode === 'camera' && (
            <div className="flex flex-col items-center">
              {cameraError ? (
                <div className="p-6 border border-[#3a3a3f] bg-[#000000] text-center space-y-4 w-full">
                  <p className="spacex-caption text-xs">{cameraError}</p>
                  <button
                    onClick={() => setActiveMode('manual')}
                    className="btn-spacex"
                  >
                    SWITCH TO MANUAL LOOKUP
                  </button>
                </div>
              ) : (
                <div className="relative w-full border border-[#3a3a3f] bg-[#000000]">
                  <div id="qr-reader-container" className="w-full min-h-[260px]" />
                  <div className="p-2 border-t border-[#3a3a3f] bg-[#000000] text-center spacex-caption text-[11px]">
                    ALIGN QR CODE IN FRAME FOR AUTOMATED TELEMETRY RECOGNITION
                  </div>
                </div>
              )}
            </div>
          )}

          {/* UPLOAD IMAGE MODE */}
          {activeMode === 'upload' && (
            <div className="text-center space-y-4">
              <label className="border border-dashed border-[#3a3a3f] hover:border-[#ffffff] p-8 flex flex-col items-center justify-center cursor-pointer bg-[#000000] transition-colors">
                <Upload className="w-8 h-8 text-[#ffffff] mb-2" />
                <span className="font-['D-DIN-Bold'] uppercase text-sm text-[#ffffff] tracking-wider">
                  UPLOAD QR IMAGE / TELEPHOTO
                </span>
                <span className="spacex-caption text-[11px] mt-1">PNG, JPG, WEBP SUPPORTED</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
              <p className="spacex-caption text-[11px]">
                UPLOAD ANY SERIALIZED QR TAG TO SIMULATE DIRECT BARCODE SCANNING.
              </p>
            </div>
          )}

          {/* MANUAL / PRESET MODE */}
          {(activeMode === 'manual' || cameraError) && (
            <div className="space-y-6">
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <label className="block spacex-caption">
                  INPUT SERIALIZED TRACKING CODE:
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="ECO-2026-NIL1"
                    className="flex-1 px-4 py-2.5 bg-[#000000] border border-[#3a3a3f] text-[#ffffff] text-sm font-mono focus:border-[#ffffff]"
                  />
                  <button
                    type="submit"
                    disabled={loading || !manualCode.trim()}
                    className="btn-spacex"
                  >
                    LOOKUP
                  </button>
                </div>
              </form>

              {/* Quick Preset Scans for Testing */}
              <div className="pt-4 border-t border-[#3a3a3f]">
                <div className="spacex-caption mb-3">
                  // TELEMETRY MANIFEST (CLICK TO SIMULATE SCAN):
                </div>
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {availableItems.length === 0 ? (
                    <p className="text-xs text-[#5a5a5f] font-mono">NO ACTIVE ASSETS DETECTED...</p>
                  ) : (
                    availableItems.map((item) => (
                      <button
                        key={item._id || item.trackingCode}
                        type="button"
                        onClick={() => handleScannedCode(item.trackingCode)}
                        disabled={loading}
                        className="w-full text-left p-3 bg-[#000000] border border-[#3a3a3f] hover:border-[#ffffff] transition-colors flex items-center justify-between group rounded-none"
                      >
                        <div>
                          <span className="font-mono text-sm text-[#ffffff] font-bold">{item.trackingCode}</span>
                          <span className="ml-3 text-xs text-[#f0f0fa] uppercase font-['D-DIN-Bold']">{item.type}</span>
                          <p className="spacex-caption text-[11px] mt-1">
                            {formatHostel(item.userHostel)} // STATUS: {item.status?.replace('_', ' ')}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#5a5a5f] group-hover:text-[#ffffff] transition-colors" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

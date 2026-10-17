'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  Laptop,
  Smartphone,
  Zap,
  BatteryCharging,
  Cpu,
  Tv,
  Radio,
  HelpCircle,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Download,
  Printer,
  Calendar,
  ArrowLeft,
  X,
  LogOut,
  KeyRound,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { formatHostel } from '@/lib/formatHostel';

const ITEM_TYPES = [
  { label: 'Laptop / Computer', icon: Laptop, defaultWeight: 2.2, desc: 'Laptops, motherboards, desktop units' },
  { label: 'Mobile Phone / Tablet', icon: Smartphone, defaultWeight: 0.4, desc: 'Smartphones, feature phones, tablets' },
  { label: 'Charger & Cables', icon: Zap, defaultWeight: 0.3, desc: 'USB cables, adapters, power bricks' },
  { label: 'Battery / Power Bank', icon: BatteryCharging, defaultWeight: 0.6, desc: 'Power banks, Li-ion battery packs' },
  { label: 'Circuit Board / PCB', icon: Cpu, defaultWeight: 1.2, desc: 'Arduino, IoT kits, components' },
  { label: 'Monitor / TV Display', icon: Tv, defaultWeight: 5.5, desc: 'LED/LCD screens, monitors' },
  { label: 'Home Appliance', icon: Radio, defaultWeight: 3.0, desc: 'Kettles, desk fans, audio gear' },
  { label: 'Other Electronics', icon: HelpCircle, defaultWeight: 1.0, desc: 'Peripherals, mice, keyboards' },
];

const SAMPLE_PHOTOS = [
  { name: 'Laptop', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80' },
  { name: 'Phones', url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80' },
  { name: 'Circuit/PCB', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80' },
  { name: 'Display/TV', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80' },
];

const BRANCHES = [
  'Computer Science & Engineering (CSE)',
  'Electronics & Communication (ECE)',
  'Artificial Intelligence & Machine Learning (AIML)',
  'Information Science & Engineering (ISE)',
  'Mechanical Engineering (ME)',
  'Biotechnology (BT)',
  'Civil Engineering',
];

export default function RegisterEWastePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [type, setType] = useState(ITEM_TYPES[0].label);
  const [approxWeight, setApproxWeight] = useState(ITEM_TYPES[0].defaultWeight.toString());
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_PHOTOS[0].url);
  const [notes, setNotes] = useState('');
  const [otpCopied, setOtpCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [registeredItem, setRegisteredItem] = useState(null);

  const handleTypeSelect = (selected) => {
    setType(selected.label);
    setApproxWeight(selected.defaultWeight.toString());
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const weightNum = parseFloat(approxWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setError('Please provide a valid approximate weight in kg');
      return;
    }

    setLoading(true);

    try {
      const res = await api.registerItem({
        type,
        approxWeight: weightNum,
        branch,
        photoUrl,
        notes,
      });

      if (res.success && res.item) {
        setRegisteredItem(res.item);
      } else {
        setError(res.message || 'Failed to register e-waste item');
      }
    } catch (err) {
      setError(err.message || 'Network error occurred while connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQr = () => {
    if (!registeredItem?.qrCode) return;
    const link = document.createElement('a');
    link.href = registeredItem.qrCode;
    link.download = `ecoloop-qr-${registeredItem.trackingCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!registeredItem) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>EcoLoop QR Tag - ${registeredItem.trackingCode}</title>
          <style>
            body { font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #ffffff; color: #000000; }
            .card { border: 2px solid #000000; padding: 24px; text-align: center; max-width: 320px; }
            img { width: 220px; height: 220px; }
            h2 { margin: 8px 0 4px; font-weight: bold; letter-spacing: 2px; }
            .code { font-family: monospace; font-size: 16px; font-weight: bold; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 0; margin: 8px 0 16px; }
            p { margin: 4px 0; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>ECOLOOP DIGITAL PASSPORT</h2>
            <div class="code">${registeredItem.trackingCode}</div>
            <img src="${registeredItem.qrCode}" />
            <p><strong>ITEM:</strong> ${registeredItem.type}</p>
            <p><strong>MASS:</strong> ${registeredItem.approxWeight} KG</p>
            <p><strong>DEPOSITOR:</strong> ${registeredItem.userName} (${formatHostel(registeredItem.userHostel)})</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const resetForm = () => {
    setRegisteredItem(null);
    setType(ITEM_TYPES[0].label);
    setApproxWeight(ITEM_TYPES[0].defaultWeight.toString());
    setPhotoUrl(SAMPLE_PHOTOS[0].url);
    setNotes('');
    setError('');
  };

  const estimatedPoints = Math.round((parseFloat(approxWeight) || 0) * 10);

  return (
    <div className="min-h-screen bg-[#000000] text-[#f0f0fa] flex flex-col">
      {/* Top Telemetry Strip */}
      <div className="border-b border-[#3a3a3f] px-6 py-2 text-xs bg-[#000000]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffffff] inline-block" />
            <span className="spacex-caption">MISSION ACTIVE:</span>
            <span className="font-mono text-xs text-[#f0f0fa] uppercase">
              [{user?.role || 'USER'}] {user?.name || ''}
            </span>
            {user?.hostel && (
              <span className="spacex-caption hidden md:inline">
                // STATION: {user.hostel}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {logout && (
              <button
                onClick={logout}
                className="text-[#5a5a5f] hover:text-[#ffffff] text-[11px] font-bold uppercase tracking-[1.17px] transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-0 p-0"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <header className="border-b border-[#3a3a3f] bg-[#000000] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-['D-DIN-Bold'] text-2xl font-black tracking-[3px] text-[#ffffff] uppercase">
              ECOLOOP
            </Link>
            <span className="spacex-caption border-l border-[#3a3a3f] pl-4 hidden sm:inline">
              REGISTER E-WASTE
            </span>
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

      {/* Main Full-Bleed Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        {!registeredItem ? (
          <div className="space-y-12">
            <section className="border-b border-[#3a3a3f] pb-8">
              <div className="spacex-caption mb-3">// HARDWARE INGESTION PROTOCOL</div>
              <h1 className="font-['D-DIN-Bold'] text-4xl sm:text-6xl font-black text-[#ffffff] tracking-tight uppercase leading-[0.95]">
                REGISTER DECOMMISSIONED ASSET
              </h1>
              <p className="text-[#f0f0fa] text-base mt-4 max-w-2xl leading-relaxed">
                Every registered item is cryptographically serialized with a digital QR passport tag. Verified weight earns 10 reward points per kilogram upon depot weigh-in.
              </p>
            </section>

            <form onSubmit={handleSubmit} className="space-y-10">
              {error && (
                <div className="p-4 border border-[#ffffff] bg-[#000000] text-xs flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-mono">{error}</span>
                </div>
              )}

              {/* Category selection */}
              <div>
                <label className="block spacex-caption mb-4">SELECT ASSET HARDWARE CLASSIFICATION</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {ITEM_TYPES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = type === t.label;
                    return (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => handleTypeSelect(t)}
                        className={`p-5 text-left border rounded-none transition-all flex flex-col justify-between h-36 ${
                          isSelected
                            ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                            : 'border-[#3a3a3f] bg-[#000000] text-[#5a5a5f] hover:text-[#ffffff] hover:border-[#5a5a5f]'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <div>
                          <div className="font-['D-DIN-Bold'] text-sm uppercase tracking-wider leading-tight">
                            {t.label.split('/')[0]}
                          </div>
                          <div className="text-[10px] font-mono mt-1 opacity-70">
                            ~{t.defaultWeight} KG
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Weight estimation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[#3a3a3f] pt-8">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="spacex-caption">ESTIMATED MASS (KG)</label>
                    <span className="spacex-caption text-[#ffffff]">
                      ALLOCATION: ~{estimatedPoints} PTS
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.05"
                      required
                      value={approxWeight}
                      onChange={(e) => setApproxWeight(e.target.value)}
                      placeholder="1.5"
                      className="w-full px-4 py-3 bg-[#000000] border border-[#3a3a3f] text-[#ffffff] font-mono focus:border-[#ffffff]"
                    />
                    <span className="absolute right-4 top-3 text-xs text-[#5a5a5f] font-mono">KG</span>
                  </div>

                  <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                    <span className="spacex-caption text-[10px]">PRESETS:</span>
                    {[0.3, 0.8, 1.5, 2.5, 5.0, 10.0].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setApproxWeight(w.toString())}
                        className="px-3 py-1 border border-[#3a3a3f] hover:border-[#ffffff] text-[#5a5a5f] hover:text-[#ffffff] text-xs font-mono transition-colors rounded-full"
                      >
                        {w} KG
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subsystem Notes */}
                <div>
                  <label className="block spacex-caption mb-2">SUBSYSTEM CONDITION &amp; NOTES (OPTIONAL)</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Swollen battery pack, cracked panel, included power cables..."
                    className="w-full px-4 py-3 bg-[#000000] border border-[#3a3a3f] text-[#f0f0fa] text-xs focus:border-[#ffffff]"
                  />
                </div>
              </div>

              {/* Photo Proof */}
              <div className="border-t border-[#3a3a3f] pt-8">
                <label className="block spacex-caption mb-4">TELEMETRY PHOTOGRAPHY (OPTIONAL)</label>
                <div className="flex flex-wrap gap-4 items-center">
                  {photoUrl ? (
                    <div className="relative w-32 h-32 border border-[#3a3a3f] bg-[#000000] shrink-0">
                      <img src={photoUrl} alt="Preview" className="w-full h-full object-cover grayscale" />
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="absolute top-1 right-1 p-1 bg-black text-white hover:text-[#ffffff] border border-[#3a3a3f]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 border border-dashed border-[#3a3a3f] hover:border-[#ffffff] flex flex-col items-center justify-center cursor-pointer bg-[#000000] text-[#5a5a5f] hover:text-[#ffffff] transition-colors shrink-0">
                      <Upload className="w-6 h-6" />
                      <span className="text-[10px] font-mono uppercase mt-2">Upload</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  )}

                  <div className="space-y-3">
                    <p className="spacex-caption text-[11px]">CALIBRATED SAMPLE REFERENCES:</p>
                    <div className="flex flex-wrap gap-2">
                      {SAMPLE_PHOTOS.map((sp) => (
                        <button
                          key={sp.name}
                          type="button"
                          onClick={() => setPhotoUrl(sp.url)}
                          className="px-3 py-1 border border-[#3a3a3f] hover:border-[#ffffff] text-[#5a5a5f] hover:text-[#ffffff] text-xs uppercase font-['D-DIN-Bold'] transition-colors rounded-full"
                        >
                          {sp.name}
                        </button>
                      ))}
                      <label className="px-3 py-1 border border-[#3a3a3f] hover:border-[#ffffff] text-[#f0f0fa] hover:text-[#ffffff] text-xs uppercase font-['D-DIN-Bold'] cursor-pointer inline-flex items-center gap-1.5 rounded-full">
                        <Camera className="w-3.5 h-3.5" /> Custom File
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Branch / Department Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="spacex-caption">ACADEMIC BRANCH / DEPARTMENT</label>
                  <span className="spacex-caption text-[#ffffff]">DEPARTMENT CREDIT SYSTEM</span>
                </div>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-3 bg-[#000000] border border-[#3a3a3f] text-[#f0f0fa] text-xs font-mono focus:border-[#ffffff]"
                >
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="border-t border-[#3a3a3f] pt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-spacex py-3 px-8 text-sm"
                >
                  {loading ? (
                    <span>GENERATING 4-DIGIT SECURE OTP...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>SUBMIT E-WASTE &amp; GENERATE 4-DIGIT OTP</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* RESULT AFTER REGISTRATION */
          <div className="space-y-12">
            <section className="border-b border-[#3a3a3f] pb-8 flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="spacex-caption mb-3">// 4-DIGIT VERIFICATION KEY GENERATED: {registeredItem.trackingCode}</div>
                <h1 className="font-['D-DIN-Bold'] text-4xl sm:text-6xl font-black text-[#ffffff] uppercase tracking-tight">
                  HANDOVER OTP READY
                </h1>
                <p className="text-[#f0f0fa] text-base mt-2 max-w-2xl leading-relaxed">
                  Your electronic asset is registered. Present this <strong>4-digit handover OTP</strong> to the collection team when they arrive to weigh and collect the item.
                </p>
              </div>

              <button onClick={resetForm} className="btn-spacex">
                <span>Register Another Item</span>
              </button>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              {/* 4-Digit Handover OTP Hero Display */}
              <div className="border-2 border-white bg-[#0a0a0a] p-8 text-center flex flex-col items-center">
                <div className="spacex-caption text-xs text-white mb-2 font-bold">
                  // SECURE 4-DIGIT PHYSICAL HANDOVER OTP
                </div>

                <div className="flex items-center justify-center gap-3 my-6">
                  {(registeredItem.otp || '7492').split('').map((d, i) => (
                    <div
                      key={i}
                      className="w-16 h-20 bg-black border-2 border-white flex items-center justify-center font-mono text-4xl font-black text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                <div className="font-mono text-base font-bold text-[#ffffff] tracking-widest border border-[#3a3a3f] px-4 py-1.5 mb-6 bg-[#000000]">
                  {registeredItem.trackingCode}
                </div>

                <div className="p-3 bg-white/5 border border-white/20 text-xs font-mono text-[#a1a1aa] mb-6 text-left space-y-1">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>ZERO-QR REQUIRED: OTP HANDOVER</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Collection officer will type this 4-digit OTP into their terminal upon pickup to verify custody and release your instant food court meal coupon!
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(registeredItem.otp || '7492');
                      setOtpCopied(true);
                      setTimeout(() => setOtpCopied(false), 2000);
                    }}
                    className="btn-spacex"
                  >
                    {otpCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{otpCopied ? 'OTP Copied' : 'Copy 4-Digit OTP'}</span>
                  </button>
                  <button onClick={handlePrint} className="btn-spacex btn-spacex-muted">
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Pass</span>
                  </button>
                </div>
              </div>

              {/* Hardware Details Manifest */}
              <div className="border border-[#3a3a3f] bg-[#000000] p-8 space-y-6">
                <div className="border-b border-[#3a3a3f] pb-4">
                  <h3 className="font-['D-DIN-Bold'] text-xl uppercase tracking-wider text-[#ffffff]">
                    PASSPORT SPECIFICATION
                  </h3>
                  <span className="spacex-caption">VERIFIED CPCB MANIFEST ENTRY</span>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div className="flex justify-between border-b border-[#3a3a3f] pb-2">
                    <span className="spacex-caption">CLASSIFICATION:</span>
                    <span className="text-[#ffffff] uppercase">{registeredItem.type}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#3a3a3f] pb-2">
                    <span className="spacex-caption">APPROX MASS:</span>
                    <span className="text-[#ffffff]">{registeredItem.approxWeight} KG</span>
                  </div>
                  <div className="flex justify-between border-b border-[#3a3a3f] pb-2">
                    <span className="spacex-caption">CURRENT STATUS:</span>
                    <span className="text-[#ffffff] uppercase">{registeredItem.status?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#3a3a3f] pb-2">
                    <span className="spacex-caption">REGISTERED BY:</span>
                    <span className="text-[#ffffff]">{registeredItem.userName} ({formatHostel(registeredItem.userHostel)})</span>
                  </div>
                  <div className="flex justify-between border-b border-[#3a3a3f] pb-2">
                    <span className="spacex-caption">CREDIT ESTIMATION:</span>
                    <span className="text-[#ffffff]">~{Math.round((registeredItem.approxWeight || 0) * 10)} PTS</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <Link href={`/tracker?code=${registeredItem.trackingCode}`} className="btn-spacex w-full">
                    <span>Track Asset Live</span>
                  </Link>
                  <Link href="/" className="btn-spacex btn-spacex-muted w-full">
                    <span>Return to Overview</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

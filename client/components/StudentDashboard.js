import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Plus,
  QrCode,
  Calendar,
  Clock,
  ArrowRight,
  FileText,
  KeyRound,
  Award,
  Gift,
  Sparkles,
} from 'lucide-react';
import { formatLocation } from '@/lib/formatHostel';
import CertificateModal from '@/components/CertificateModal';

export default function StudentDashboard({
  items = [],
  loading,
  onOpenRegister,
  onOpenSchedule,
  onOpenTracker,
  onOpenQr,
  onOpenLeaderboard,
}) {
  const { user } = useAuth();
  const [selectedCertItem, setSelectedCertItem] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const totalRegistered = items.length;
  const scheduledCount = items.filter((i) => i.status === 'scheduled').length;
  const completedCount = items.filter((i) => i.status === 'verified_recycled').length;
  const collectedCount = items.filter((i) => ['collected', 'handed_over', 'verified_recycled'].includes(i.status)).length;
  const totalKg = items.reduce((acc, curr) => acc + (curr.actualWeight || curr.approxWeight || 0), 0);

  const handlePrintCertificate = (item) => {
    setSelectedCertItem(item);
    setIsCertModalOpen(true);
  };

  return (
    <div className="space-y-16">
      {/* Hero Mission Telemetry Banner */}
      <section className="border-b border-[#3a3a3f] pb-12">
        <div className="spacex-caption mb-3">// STATION: {user?.hostel || 'NANDANI'} // OPERATOR: {user?.name || 'STUDENT'}</div>
        <h1 className="font-['D-DIN-Bold'] text-4xl sm:text-6xl font-black text-[#ffffff] tracking-tight uppercase leading-[0.95]">
          CAMPUS RECOVERY OVERVIEW
        </h1>
        <p className="text-[#f0f0fa] text-base mt-4 max-w-2xl leading-relaxed">
          Real-time circular telemetry for personal and departmental decommissioned electronics. Every item is serialized with a cryptographic QR passport.
        </p>

        {/* Aerospace Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-8 border-t border-[#3a3a3f]">
          <div>
            <div className="spacex-caption">TOTAL RECOVERED</div>
            <div className="font-['D-DIN-Bold'] text-3xl sm:text-5xl font-bold text-[#ffffff] mt-2">
              {totalKg.toFixed(1)} <span className="text-sm font-normal text-[#5a5a5f]">KG</span>
            </div>
            <p className="text-xs text-[#5a5a5f] mt-1 uppercase tracking-wider">{collectedCount} ITEMS VERIFIED</p>
          </div>

          <div>
            <div className="spacex-caption">CREDITS BALANCE</div>
            <div className="font-['D-DIN-Bold'] text-3xl sm:text-5xl font-bold text-[#ffffff] mt-2">
              {user?.points || 0} <span className="text-sm font-normal text-[#5a5a5f]">PTS</span>
            </div>
            <p className="text-xs text-[#5a5a5f] mt-1 uppercase tracking-wider">10 PTS / VERIFIED KG</p>
          </div>

          <div>
            <div className="spacex-caption">PENDING COLLECTION</div>
            <div className="font-['D-DIN-Bold'] text-3xl sm:text-5xl font-bold text-[#ffffff] mt-2">
              {scheduledCount}
            </div>
            <p className="text-xs text-[#5a5a5f] mt-1 uppercase tracking-wider">SCHEDULED SLOTS</p>
          </div>

          <div>
            <div className="spacex-caption">RECYCLED YIELD</div>
            <div className="font-['D-DIN-Bold'] text-3xl sm:text-5xl font-bold text-[#ffffff] mt-2">
              {completedCount}
            </div>
            <p className="text-xs text-[#5a5a5f] mt-1 uppercase tracking-wider">FULL DISMANTLE</p>
          </div>
        </div>
      </section>

      {/* Food Coupons Rewards Section */}
      <section className="border border-[#3a3a3f] bg-[#0a0a0a] p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#3a3a3f] pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍔</span>
            <div>
              <div className="spacex-caption text-[#10b981] font-bold">
                // CAMPUS CIRCULAR FOOD INCENTIVE REWARDS
              </div>
              <h2 className="font-['D-DIN-Bold'] text-2xl text-white uppercase tracking-wider mt-0.5">
                MY FOOD COURT VOUCHERS &amp; MEAL COUPONS
              </h2>
            </div>
          </div>
          <span className="spacex-caption font-mono text-xs">
            INSTANTLY ISSUED ON DEPOT HANDOVER
          </span>
        </div>

        {items.filter((i) => i.foodCoupon && i.foodCoupon.couponCode).length === 0 ? (
          <div className="bg-[#000000] border border-[#27272a] p-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="spacex-caption text-[#38bdf8]">// QUALITY-BASED FOOD REWARD SYSTEM</span>
              <p className="font-['Barlow_Condensed'] font-bold text-lg text-white uppercase tracking-wide">
                Drop off hardware to instantly earn Free Campus Food Vouchers!
              </p>
              <p className="text-xs text-[#888891] font-mono max-w-xl">
                Grade A (Working/Mint): <span className="text-white font-bold">₹180 Meal Combo</span> • Grade B (Repairable): <span className="text-white font-bold">₹100 Dosa/Sandwich + Juice</span> • Grade C (Scrap): <span className="text-white font-bold">₹50 Coffee &amp; Snack</span>.
              </p>
            </div>
            <Link href="/register" className="btn-spacex shrink-0 whitespace-nowrap">
              <span>Register Item to Claim Food</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items
              .filter((i) => i.foodCoupon && i.foodCoupon.couponCode)
              .map((item) => {
                const coupon = item.foodCoupon;
                return (
                  <div
                    key={item._id || item.trackingCode}
                    className="border border-[#10b981] bg-[#000000] p-5 space-y-4 flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-black bg-[#10b981] px-2 py-0.5 uppercase tracking-wider">
                          {coupon.grade || 'VERIFIED DROP-OFF'}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#10b981]">
                          {coupon.value} FREE
                        </span>
                      </div>

                      <h3 className="font-['D-DIN-Bold'] text-base text-white uppercase leading-snug">
                        {coupon.title}
                      </h3>
                      <p className="text-[11px] text-[#888891] font-mono leading-relaxed">
                        {coupon.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#27272a] space-y-2 text-xs font-mono">
                      <div className="bg-[#0a0a0a] border border-[#3a3a3f] p-2.5 text-center">
                        <span className="spacex-caption block text-[9px] mb-1">REDEEM CODE AT COUNTER:</span>
                        <span className="font-mono text-base font-bold text-white tracking-widest selection:bg-white selection:text-black">
                          {coupon.couponCode}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#888891]">
                        <span>OUTLET: {coupon.outlet?.split('&')[0] || 'Food Court'}</span>
                        <span className="text-[#10b981]">Valid 30 Days</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* Official Recycling Certificates Showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h2 className="font-['D-DIN-Bold'] text-xl uppercase tracking-wider text-white">
              MY OFFICIAL GREEN RECYCLING CERTIFICATES ({items.filter((i) => ['collected', 'handed_over', 'verified_recycled'].includes(i.status)).length})
            </h2>
          </div>
          <span className="spacex-caption text-emerald-400">// STATUTORY CPCB / NAAC VERIFIED</span>
        </div>

        {items.filter((i) => ['collected', 'handed_over', 'verified_recycled'].includes(i.status)).length === 0 ? (
          <div className="border border-dashed border-[#3a3a3f] p-8 text-center bg-[#0a0a0c] space-y-2">
            <Award className="w-8 h-8 text-[#5a5a5f] mx-auto" />
            <div className="font-['D-DIN-Bold'] text-sm uppercase text-[#a1a1aa]">
              NO COLLECTED ITEMS YET
            </div>
            <p className="text-xs text-[#71717a] max-w-md mx-auto">
              Once the collection squad verifies your 4-digit OTP and weighs your e-waste, your official CPCB-compliant Green Recycling Certificate will be immediately available here to view, print, and download.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items
              .filter((i) => ['collected', 'handed_over', 'verified_recycled'].includes(i.status))
              .map((item) => (
                <div
                  key={item._id || item.trackingCode}
                  className="border-2 border-emerald-500/60 bg-[#001408] p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-emerald-500 text-black font-mono text-[10px] font-bold uppercase tracking-wider">
                        {item.status === 'verified_recycled' ? '✓ FULLY RECYCLED' : '✓ CUSTODY VERIFIED'}
                      </span>
                      <span className="font-mono text-xs text-emerald-400 font-bold">
                        {item.actualWeight || item.approxWeight} KG
                      </span>
                    </div>

                    <h3 className="font-['D-DIN-Bold'] text-base text-white uppercase mt-1">
                      {item.type}
                    </h3>
                    <p className="font-mono text-[11px] text-[#a1a1aa]">
                      REF: {item.trackingCode} • {item.userBranch || 'CSE Dept'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-emerald-950 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400/80 font-mono">
                      +{(parseFloat(item.actualWeight || item.approxWeight || 1) * 10).toFixed(0)} Green PTS
                    </span>

                    <button
                      onClick={() => handlePrintCertificate(item)}
                      className="btn-spacex py-1.5 px-3 text-xs bg-emerald-500 text-black hover:bg-emerald-400 font-bold flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Download Certificate</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Monthly Rewards Banner: Amazon Gift Cards */}
      <section className="p-4 bg-[#0a0a0c] border border-amber-400/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-amber-400/80 bg-black flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="font-['D-DIN-Bold'] text-sm uppercase text-white tracking-wide">
              MONTHLY CHAMPIONSHIP: WIN ₹2,500 AMAZON GIFT CARDS &amp; COOL TECH GOODIES
            </div>
            <p className="text-[11px] text-[#a1a1aa] font-mono mt-0.5">
              Hand over your e-waste with your 4-digit OTP. Top student recyclers this month receive Amazon Gift Cards &amp; Hoodies!
            </p>
          </div>
        </div>
        {onOpenLeaderboard && (
          <button onClick={onOpenLeaderboard} className="btn-spacex py-1.5 px-3 text-xs shrink-0 whitespace-nowrap">
            <span>View Standings &amp; Prizes</span>
          </button>
        )}
      </section>

      {/* Primary Actions Track */}
      <section className="flex flex-wrap items-center justify-between gap-6 border-b border-[#3a3a3f] pb-8">
        <div>
          <h2 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider">
            SERIALIZED RECOVERY MANIFEST
          </h2>
          <span className="spacex-caption">LIVE CRYPTOGRAPHIC TELEMETRY LEDGER</span>
        </div>

        <div className="flex items-center gap-4">
          {onOpenLeaderboard && (
            <button onClick={onOpenLeaderboard} className="btn-spacex-muted btn-spacex">
              <span>Station Standings</span>
            </button>
          )}

          <Link href="/register" className="btn-spacex">
            <Plus className="w-3.5 h-3.5" />
            <span>Register E-Waste</span>
          </Link>
        </div>
      </section>

      {/* Manifest Entries List */}
      <section>
        {loading ? (
          <div className="py-24 text-center">
            <span className="spacex-caption animate-pulse">POLLING LOCAL TELEMETRY MANIFEST...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-24 text-center border border-[#3a3a3f] p-12">
            <div className="spacex-caption mb-3">// STATUS: ZERO ENTRIES</div>
            <h3 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase mb-4">
              NO HARDWARE REGISTERED ON THIS STATION
            </h3>
            <p className="text-[#5a5a5f] text-sm max-w-md mx-auto mb-8">
              Log personal laptops, mobile phones, adapters, or institutional lab units to initiate circular reclamation.
            </p>
            <Link href="/register" className="btn-spacex">
              <span>Register Hardware</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>TRACKING ID & CATEGORY</th>
                  <th>STATION / LOCATION</th>
                  <th>CALIBRATED WEIGHT</th>
                  <th>TELEMETRY STATUS</th>
                  <th style={{ textAlign: 'right' }}>COMMANDS</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id || item.trackingCode}>
                    <td>
                      <div className="font-mono text-xs text-[#ffffff] tracking-wider uppercase font-bold">
                        {item.trackingCode}
                      </div>
                      <div className="text-sm font-semibold text-[#f0f0fa] mt-0.5">{item.type}</div>
                      {['registered', 'scheduled'].includes(item.status) && (
                        <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 bg-black border border-white text-white text-[10px] font-mono">
                          <KeyRound className="w-2.5 h-2.5 text-amber-400" />
                          <span>HANDOVER OTP: <strong className="text-white font-bold tracking-widest">{item.otp || '7492'}</strong></span>
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="text-xs text-[#f0f0fa]">{formatLocation(item.location, item.userHostel)}</div>
                      {item.pickupDate && (
                        <div className="spacex-caption mt-0.5">SLOT: {item.pickupDate}</div>
                      )}
                    </td>

                    <td>
                      <span className="font-mono text-sm text-[#ffffff]">
                        {item.actualWeight ? `${item.actualWeight} kg` : `~${item.approxWeight} kg`}
                      </span>
                      <span className="spacex-caption block text-[10px]">
                        {item.actualWeight ? 'VERIFIED' : 'DECLARED'}
                      </span>
                    </td>

                    <td>
                      <span className="font-mono text-xs uppercase tracking-wider text-[#ffffff] border border-[#3a3a3f] px-2.5 py-1 inline-block">
                        [{item.status.replace('_', ' ')}]
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="inline-flex items-center gap-2 justify-end">
                        {item.status === 'registered' && (
                          <button
                            onClick={() => onOpenSchedule(item)}
                            className="btn-spacex py-1 px-3 text-[11px]"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>Slot</span>
                          </button>
                        )}

                        {['registered', 'scheduled'].includes(item.status) ? (
                          <button
                            onClick={() => onOpenQr(item)}
                            className="btn-spacex py-1 px-3 text-[11px] border-amber-400 text-white"
                            title="View Handover OTP"
                          >
                            <KeyRound className="w-3 h-3 text-amber-400" />
                            <span>OTP</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePrintCertificate(item)}
                            className="btn-spacex py-1 px-3 text-[11px] border-emerald-400 text-white"
                            title="Download Certificate"
                          >
                            <Award className="w-3 h-3 text-emerald-400" />
                            <span>Certificate</span>
                          </button>
                        )}

                        <button
                          onClick={() => onOpenTracker(item._id || item.id)}
                          className="btn-spacex py-1 px-3 text-[11px]"
                          title="Audit Trail"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Trail</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Interactive Official Certificate Modal */}
      <CertificateModal
        item={selectedCertItem}
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
      />
    </div>
  );
}

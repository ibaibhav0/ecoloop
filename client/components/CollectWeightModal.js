'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { X, Scale, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatHostel } from '@/lib/formatHostel';

export default function CollectWeightModal({ item, isOpen, onClose, onSuccess }) {
  const { refreshUser } = useAuth();
  const [actualWeight, setActualWeight] = useState(item?.approxWeight?.toString() || '2.0');
  const [conditionQuality, setConditionQuality] = useState('Grade B - Good / Repairable');
  const [location, setLocation] = useState(item?.location || 'Central Campus E-Waste Depot');
  const [notes, setNotes] = useState('Weighed and verified by collection team on campus scale');
  const [issuedCoupon, setIssuedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const weightNum = parseFloat(actualWeight) || 0;
  const calculatedPoints = Math.round(weightNum * 10);

  const QUALITY_OPTIONS = [
    {
      id: 'Grade A - Excellent / Working',
      label: 'Grade A (Working / Mint)',
      sub: 'Boots up / Intact screen / Reusable',
      reward: '₹180 Deluxe Meal Voucher',
      rewardColor: 'text-[#10b981]',
      badge: 'DELUXE MEAL',
    },
    {
      id: 'Grade B - Good / Repairable',
      label: 'Grade B (Good / Minor Wear)',
      sub: 'Repairable board / Functional parts',
      reward: '₹100 Dosa/Snack + Juice',
      rewardColor: 'text-[#38bdf8]',
      badge: 'SNACK FEAST',
    },
    {
      id: 'Grade C - Scrap / Recyclable',
      label: 'Grade C (Scrap / End-of-Life)',
      sub: 'Broken / Dead components / Scrap metals',
      reward: '₹50 Coffee / Chai Voucher',
      rewardColor: 'text-[#fbbf24]',
      badge: 'REFRESHMENT',
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.collectItem(item._id || item.id, {
        actualWeight: weightNum,
        conditionQuality,
        location,
        notes,
      });

      if (res.success) {
        await refreshUser();
        if (res.foodCoupon) {
          setIssuedCoupon(res.foodCoupon);
        } else {
          onSuccess(res.item);
          onClose();
        }
      } else {
        setError(res.message || 'Failed to collect item');
      }
    } catch (err) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onSuccess({ ...item, status: 'collected', actualWeight: weightNum, foodCoupon: issuedCoupon, conditionQuality });
    setIssuedCoupon(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#0a0a0a] border border-[#3a3a3f] max-w-lg w-full overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-[#3a3a3f] p-4 sm:p-6 flex items-center justify-between shrink-0 bg-[#000000]">
          <div>
            <div className="spacex-caption">// TELEMETRY WEIGH-IN: {item.trackingCode}</div>
            <h2 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider mt-1">
              RECORD MASS &amp; COLLECT
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#5a5a5f] hover:text-[#ffffff] transition-colors p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {issuedCoupon ? (
          /* ISSUED FOOD COUPON CELEBRATION VIEW */
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
            <div className="border border-[#10b981] bg-[#000000] p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-[#10b981]/20 border border-[#10b981] mx-auto flex items-center justify-center text-2xl">
                🍔
              </div>
              <div>
                <div className="spacex-caption text-[#10b981] font-bold">
                  // INSTANT FOOD REWARD ALLOCATED
                </div>
                <h3 className="font-['D-DIN-Bold'] text-xl text-white uppercase mt-1">
                  {issuedCoupon.title}
                </h3>
                <p className="text-xs text-[#888891] mt-1 font-mono">
                  {issuedCoupon.description}
                </p>
              </div>

              <div className="p-4 bg-[#0a0a0a] border border-[#3a3a3f] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="spacex-caption">VOUCHER CODE:</span>
                  <span className="font-mono text-sm font-bold text-white tracking-widest bg-black px-2 py-1 border border-[#10b981]">
                    {issuedCoupon.couponCode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="spacex-caption">COMMERCIAL VALUE:</span>
                  <span className="font-mono text-white font-bold">{issuedCoupon.value} (100% FREE)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="spacex-caption">VALID OUTLETS:</span>
                  <span className="font-mono text-white">{issuedCoupon.outlet}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="spacex-caption">VALIDITY:</span>
                  <span className="font-mono text-[#10b981]">Until {issuedCoupon.validUntil} (30 Days)</span>
                </div>
              </div>

              <div className="p-3 bg-[#10b981]/10 border border-[#10b981]/30 text-left text-xs space-y-1">
                <p className="font-mono text-[#10b981] text-[11px] font-bold">
                  ✓ Food coupon digitally credited to {item.userName}'s student dashboard!
                </p>
                <p className="font-mono text-[#888891] text-[10px]">
                  Student can present voucher code or QR barcode at any campus cafeteria counter.
                </p>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full btn-spacex py-3 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>CONFIRM &amp; RETURN TO OPERATIONS</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 border border-[#ffffff] text-[#ffffff] text-xs flex items-center gap-2 bg-[#000000]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-mono">{error}</span>
              </div>
            )}

            {/* Item details review */}
            <div className="bg-[#000000] p-4 border border-[#3a3a3f] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="spacex-caption">OPERATOR:</span>
                <span className="font-mono text-[#ffffff]">{item.userName} ({formatHostel(item.userHostel)})</span>
              </div>
              <div className="flex justify-between">
                <span className="spacex-caption">CATEGORY:</span>
                <span className="font-mono text-[#ffffff] uppercase">{item.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="spacex-caption">ESTIMATED:</span>
                <span className="font-mono text-[#ffffff]">{item.approxWeight} KG</span>
              </div>
            </div>

            {/* Hardware Quality Evaluation for Food Coupon */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="spacex-caption">EVALUATE HARDWARE QUALITY &amp; FOOD REWARD</label>
                <span className="spacex-caption text-[#10b981]">INSTANT COUPON</span>
              </div>
              <div className="space-y-2">
                {QUALITY_OPTIONS.map((opt) => {
                  const isSelected = conditionQuality === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setConditionQuality(opt.id)}
                      className={`p-3 border cursor-pointer transition-all flex items-center justify-between text-left ${
                        isSelected
                          ? 'border-[#ffffff] bg-[#ffffff]/10 text-white'
                          : 'border-[#3a3a3f] bg-[#000000] text-[#888891] hover:border-[#5a5a5f]'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-['Barlow_Condensed'] font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
                          <span>{opt.label}</span>
                          {isSelected && <span className="text-[10px] bg-white text-black px-1.5 font-mono">SELECTED</span>}
                        </div>
                        <p className="text-[11px] font-mono text-[#888891]">{opt.sub}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-mono font-bold ${opt.rewardColor}`}>
                          {opt.reward}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actual Weight Input */}
            <div>
              <label className="block spacex-caption mb-2">
                CALIBRATED HARDWARE MASS (KG)
              </label>
              <div className="relative">
                <Scale className="w-4 h-4 text-[#5a5a5f] absolute left-3 top-3.5" />
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  required
                  value={actualWeight}
                  onChange={(e) => setActualWeight(e.target.value)}
                  className="w-full pl-9 pr-8 py-3 bg-[#000000] border border-[#3a3a3f] text-[#ffffff] text-base font-mono focus:border-[#ffffff]"
                />
                <span className="absolute right-4 top-3 text-xs text-[#5a5a5f] font-mono">KG</span>
              </div>
            </div>

            {/* Points Reward Banner (10 pts/kg rule) */}
            <div className="p-4 bg-[#000000] border border-[#3a3a3f] flex items-center justify-between">
              <div>
                <p className="font-['D-DIN-Bold'] text-xs uppercase tracking-wider text-[#ffffff]">CREDIT MULTIPLIER: 10 PTS / KG</p>
                <p className="spacex-caption text-[11px] mt-0.5">Student points + Instant Food Coupon</p>
              </div>
              <div className="text-right">
                <span className="font-['D-DIN-Bold'] text-2xl font-bold text-[#ffffff]">+{calculatedPoints}</span>
                <span className="text-xs font-mono text-[#5a5a5f] ml-1">PTS</span>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block spacex-caption mb-2">COLLECTION INGESTION DEPOT</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#5a5a5f] absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 bg-[#000000] border border-[#3a3a3f] text-[#ffffff] text-xs font-mono focus:border-[#ffffff]"
                />
              </div>
            </div>

            {/* Verification Notes */}
            <div>
              <label className="block spacex-caption mb-2">CHAIN OF CUSTODY LOG (OPTIONAL)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 bg-[#000000] border border-[#3a3a3f] text-[#f0f0fa] text-xs focus:border-[#ffffff]"
              />
            </div>

            <div className="pt-2 border-t border-[#3a3a3f]">
              <button
                type="submit"
                disabled={loading || weightNum <= 0}
                className="w-full btn-spacex py-3 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>RECORDING INGESTION &amp; ISSUING COUPON...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>VERIFY MASS &amp; ISSUE FOOD COUPON</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

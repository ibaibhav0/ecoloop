'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  X,
  CheckCircle2,
  Truck,
  Building,
  Recycle,
  QrCode,
  Calendar,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Utensils,
  Gift,
} from 'lucide-react';
import { formatHostel, formatLocation } from '@/lib/formatHostel';

const STAGES = [
  { key: 'registered', label: 'Registered', desc: 'Item logged & QR generated', icon: QrCode },
  { key: 'scheduled', label: 'Scheduled', desc: 'Pickup time & location confirmed', icon: Calendar },
  { key: 'collected', label: 'Collected', desc: 'Weighed & reward points awarded', icon: Truck },
  { key: 'handed_over', label: 'Handed Over', desc: 'Transferred to authorised recycler', icon: Building },
  { key: 'verified_recycled', label: 'Verified Recycled', desc: 'Safe dismantling & recovery complete', icon: Recycle },
];

export default function StatusTrackerModal({ itemId, isOpen, onClose, onViewQr }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && itemId) {
      setLoading(true);
      api
        .getItemById(itemId)
        .then((res) => {
          if (res.success) {
            setData(res);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, itemId]);

  if (!isOpen) return null;

  const item = data?.item;
  const handovers = data?.handovers || [];

  const currentStageIndex = STAGES.findIndex((s) => s.key === item?.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#0a0a0a] border border-[#3a3a3f] max-w-2xl w-full overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-[#3a3a3f] p-6 flex items-center justify-between shrink-0 bg-[#000000]">
          <div>
            <div className="flex items-center gap-2">
              <span className="spacex-caption">// ASSET TELEMETRY:</span>
              <span className="font-mono text-xs text-[#ffffff] font-bold">
                {item?.trackingCode || 'LOADING...'}
              </span>
              <span className="spacex-caption ml-2">
                [{item?.status?.replace('_', ' ').toUpperCase()}]
              </span>
            </div>
            <h2 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider mt-1">
              {item?.type || 'E-WASTE ASSET'} STATUS TRACKER
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#5a5a5f] hover:text-[#ffffff] transition-colors p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#5a5a5f] font-mono text-xs">
            <span className="inline-block animate-pulse mb-2 text-base text-[#ffffff]">///</span>
            <p className="spacex-caption">RETRIEVING CRYPTOGRAPHIC AUDIT LOG...</p>
          </div>
        ) : !item ? (
          <div className="p-8 text-center text-[#ffffff] font-mono text-xs">ASSET NOT FOUND IN TELEMETRY REGISTRY.</div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Progress Stepper */}
            <div className="bg-[#000000] p-6 border border-[#3a3a3f]">
              <p className="spacex-caption mb-6">MISSION LIFECYCLE MILESTONES:</p>
              <div className="relative flex items-center justify-between">
                {/* Connecting Line */}
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-px bg-[#3a3a3f] -z-0">
                  <div
                    className="h-full bg-[#ffffff] transition-all duration-500"
                    style={{
                      width: `${(Math.max(0, currentStageIndex) / (STAGES.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                {STAGES.map((s, index) => {
                  const isDone = index <= currentStageIndex;
                  const isCurrent = index === currentStageIndex;
                  const Icon = s.icon;
                  return (
                    <div key={s.key} className="flex flex-col items-center relative z-10 text-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'bg-[#ffffff] text-[#000000] ring-4 ring-[#ffffff]/20'
                            : isDone
                            ? 'bg-[#000000] border border-[#ffffff] text-[#ffffff]'
                            : 'bg-[#000000] border border-[#3a3a3f] text-[#5a5a5f]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[10px] font-['D-DIN-Bold'] uppercase tracking-wider mt-2 max-w-[70px] leading-tight ${
                          isCurrent ? 'text-[#ffffff] font-bold' : isDone ? 'text-[#f0f0fa]' : 'text-[#5a5a5f]'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Item Quick Facts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-[#000000] border border-[#3a3a3f]">
                <p className="spacex-caption">CREDITS BALANCE</p>
                <p className="font-['D-DIN-Bold'] text-2xl font-bold text-[#ffffff] mt-1">
                  {item.actualWeight ? Math.round(item.actualWeight * 10) : `~${Math.round(item.approxWeight * 10)}`}
                  <span className="text-xs font-mono text-[#5a5a5f] ml-1">PTS</span>
                </p>
              </div>

              <div className="p-4 bg-[#000000] border border-[#3a3a3f]">
                <p className="spacex-caption">CALIBRATED MASS</p>
                <p className="font-['D-DIN-Bold'] text-2xl font-bold text-[#ffffff] mt-1">
                  {item.actualWeight ? `${item.actualWeight}` : 'PENDING'}
                  {item.actualWeight && <span className="text-xs font-mono text-[#5a5a5f] ml-1">KG</span>}
                </p>
              </div>

              <div className="p-4 bg-[#000000] border border-[#3a3a3f]">
                <p className="spacex-caption">ESTIMATED MASS</p>
                <p className="font-['D-DIN-Bold'] text-2xl font-bold text-[#ffffff] mt-1">
                  {item.approxWeight}
                  <span className="text-xs font-mono text-[#5a5a5f] ml-1">KG</span>
                </p>
              </div>

              <div className="p-4 bg-[#000000] border border-[#3a3a3f] flex flex-col justify-between">
                <p className="spacex-caption">DIGITAL PASSPORT</p>
                <button
                  onClick={() => onViewQr && onViewQr(item)}
                  className="btn-spacex py-1.5 px-3 text-[11px] mt-2"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>VIEW TAG</span>
                </button>
              </div>
            </div>

            {/* Quality & Food Coupon Card */}
            {item.foodCoupon && (
              <div className="p-4 bg-[#0a0a0c] border-2 border-[#ffffff] text-xs relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#27272a] pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-[#ffffff]" />
                    <span className="font-['D-DIN-Bold'] uppercase tracking-wider text-sm text-[#ffffff]">
                      INSTANT FOOD COURT VOUCHER REWARD
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#ffffff] text-[#000000] font-bold">
                    QUALITY: {item.foodCoupon.grade || 'GRADE A'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <p className="font-['D-DIN-Bold'] text-base text-[#ffffff] uppercase tracking-wide">
                      {item.foodCoupon.title}
                    </p>
                    <p className="text-[11px] text-[#a1a1aa] font-mono">
                      {item.foodCoupon.description} • {item.foodCoupon.outlet}
                    </p>
                    <p className="text-[10px] text-[#71717a] font-mono">
                      Valid Until: {item.foodCoupon.validUntil} • Show code at billing counter
                    </p>
                  </div>
                  <div className="bg-[#000000] border border-[#ffffff]/50 px-4 py-2.5 text-center w-full sm:w-auto shrink-0">
                    <span className="spacex-caption block text-[9px]">REDEEM CODE</span>
                    <span className="font-mono text-sm font-bold text-[#ffffff] tracking-wider">
                      {item.foodCoupon.couponCode}
                    </span>
                    <span className="block text-[10px] text-[#22c55e] font-mono font-bold mt-0.5">₹{item.foodCoupon.value} Value</span>
                  </div>
                </div>
              </div>
            )}

            {/* Item Details and Photo */}
            <div className="flex gap-4 p-4 bg-[#000000] border border-[#3a3a3f] text-xs">
              {item.photoUrl && (
                <div className="w-20 h-20 border border-[#3a3a3f] shrink-0 bg-[#000000]">
                  <img src={item.photoUrl} alt={item.type} className="w-full h-full object-cover grayscale" />
                </div>
              )}
              <div className="space-y-1.5 flex-1 font-mono">
                <p className="text-[#f0f0fa]">
                  <span className="spacex-caption">OPERATOR:</span> {item.userName} ({item.userEmail}) // {formatHostel(item.userHostel)}
                </p>
                <p className="text-[#f0f0fa]">
                  <span className="spacex-caption">LOCATION:</span> {formatLocation(item.location, item.userHostel)}
                </p>
                {item.pickupDate && (
                  <p className="text-[#f0f0fa]">
                    <span className="spacex-caption">SCHEDULED:</span> {item.pickupDate}
                  </p>
                )}
                {item.notes && (
                  <p className="text-[#5a5a5f]">// "{item.notes}"</p>
                )}
              </div>
            </div>

            {/* Handover Audit Trail */}
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-[#3a3a3f] pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#ffffff]" />
                  <h3 className="font-['D-DIN-Bold'] text-sm text-[#ffffff] uppercase tracking-wider">
                    CHAIN OF CUSTODY VERIFICATION LOG ({handovers.length})
                  </h3>
                </div>
              </div>

              {handovers.length === 0 ? (
                <p className="spacex-caption italic">NO CUSTODY TRANSFERS RECORDED YET.</p>
              ) : (
                <div className="space-y-3">
                  {handovers.map((h, i) => (
                    <div
                      key={h._id || i}
                      className="p-4 border border-[#3a3a3f] bg-[#000000] flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full border border-[#ffffff] text-[#ffffff] flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-['D-DIN-Bold'] text-sm uppercase text-[#ffffff]">
                            {h.fromRole.replace('_', ' ')} <ArrowRight className="w-3 h-3 inline text-[#5a5a5f]" /> {h.toRole.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-[#5a5a5f] font-mono">
                            {new Date(h.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[#f0f0fa] mt-1 font-mono">{h.notes}</p>
                        <div className="flex items-center gap-4 mt-2 text-[11px] text-[#5a5a5f]">
                          {h.actorName && <span>OFFICER: <strong className="text-[#ffffff]">{h.actorName}</strong></span>}
                          {h.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {h.location}
                            </span>
                          )}
                          <span className="spacex-caption text-[#ffffff]">
                            // CRYPTOGRAPHICALLY ATTESTED
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

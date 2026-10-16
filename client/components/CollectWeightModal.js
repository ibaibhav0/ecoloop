'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { X, Scale, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatHostel } from '@/lib/formatHostel';

export default function CollectWeightModal({ item, isOpen, onClose, onSuccess }) {
  const { refreshUser } = useAuth();
  const [actualWeight, setActualWeight] = useState(item?.approxWeight?.toString() || '2.0');
  const [location, setLocation] = useState(item?.location || 'Central Campus E-Waste Depot');
  const [notes, setNotes] = useState('Weighed and verified by collection team on campus scale');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const weightNum = parseFloat(actualWeight) || 0;
  const calculatedPoints = Math.round(weightNum * 10);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.collectItem(item._id || item.id, {
        actualWeight: weightNum,
        location,
        notes,
      });

      if (res.success) {
        await refreshUser();
        onSuccess(res.item);
        onClose();
      } else {
        setError(res.message || 'Failed to collect item');
      }
    } catch (err) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#0a0a0a] border border-[#3a3a3f] max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="border-b border-[#3a3a3f] p-6 flex items-center justify-between bg-[#000000]">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              <p className="spacex-caption text-[11px] mt-0.5">Automated student allocation</p>
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
              className="w-full btn-spacex py-3"
            >
              {loading ? (
                <span>RECORDING INGESTION TELEMETRY...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>VERIFY MASS &amp; ALLOCATE CREDITS</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { X, Building, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatHostel } from '@/lib/formatHostel';

const RECYCLERS = [
  'Janavi Bairoliya (Authorised Recycler - Netravati Facility)',
  'GreenTech Certified Campus Recyclers',
  'EcoReclaim Advanced Material Recovery (Unit 4)',
  'State Pollution Control Board Authorized Hub',
];

export default function HandoverRecyclerModal({ item, isOpen, onClose, onSuccess }) {
  const [recyclerName, setRecyclerName] = useState(RECYCLERS[0]);
  const [location, setLocation] = useState('Campus Central Sorting & Consolidation Bay');
  const [notes, setNotes] = useState('Consolidated into Recycler Outbound Dispatch Batch #B-409');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.handoverToRecycler(item._id || item.id, {
        recyclerName,
        location,
        notes,
      });

      if (res.success) {
        onSuccess(res.item);
        onClose();
      } else {
        setError(res.message || 'Failed to complete handover');
      }
    } catch (err) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#0a0a0a] border border-[#3a3a3f] max-w-md w-full overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-[#3a3a3f] p-4 sm:p-6 flex items-center justify-between shrink-0 bg-[#000000]">
          <div>
            <div className="spacex-caption">// OUTBOUND DISPATCH: {item.trackingCode}</div>
            <h2 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider mt-1">
              TRANSFER TO RECYCLER
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#5a5a5f] hover:text-[#ffffff] transition-colors p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 border border-[#ffffff] text-[#ffffff] text-xs flex items-center gap-2 bg-[#000000]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-mono">{error}</span>
            </div>
          )}

          {/* Item details */}
          <div className="bg-[#000000] p-4 border border-[#3a3a3f] text-xs space-y-2">
            <div className="flex justify-between">
              <span className="spacex-caption">ITEM CATEGORY:</span>
              <strong className="font-mono text-[#ffffff] uppercase">{item.type}</strong>
            </div>
            <div className="flex justify-between">
              <span className="spacex-caption">VERIFIED MASS:</span>
              <strong className="font-mono text-[#ffffff]">{item.actualWeight || item.approxWeight} KG</strong>
            </div>
            <div className="flex justify-between">
              <span className="spacex-caption">ORIGIN STATION:</span>
              <span className="font-mono text-[#ffffff]">{formatHostel(item.userHostel)} ({item.userName})</span>
            </div>
          </div>

          {/* Select Recycler */}
          <div>
            <label className="block spacex-caption mb-2">
              AUTHORISED RECYCLER PARTNER
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-[#5a5a5f] absolute left-3 top-3.5" />
              <select
                value={recyclerName}
                onChange={(e) => setRecyclerName(e.target.value)}
                className="w-full pl-9 pr-3 py-3 bg-[#000000] border border-[#3a3a3f] text-[#ffffff] text-xs font-mono focus:border-[#ffffff]"
              >
                {RECYCLERS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Handover Location */}
          <div>
            <label className="block spacex-caption mb-2">DISPATCH &amp; TRANSFER POINT</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 bg-[#000000] border border-[#3a3a3f] text-[#ffffff] text-xs font-mono focus:border-[#ffffff]"
            />
          </div>

          {/* Handover Notes */}
          <div>
            <label className="block spacex-caption mb-2">CHAIN OF CUSTODY MANIFEST NOTES</label>
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
              disabled={loading}
              className="w-full btn-spacex py-3"
            >
              {loading ? (
                <span>EXECUTING CUSTODY TRANSFER...</span>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span>CONFIRM RECYCLER HANDOVER</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

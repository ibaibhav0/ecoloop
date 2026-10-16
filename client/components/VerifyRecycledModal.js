'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatHostel } from '@/lib/formatHostel';

const FACILITIES = [
  'EcoReclaim Certified Dismantling & Material Recovery (Unit 4)',
  'GreenTech State Authorized Recycling Plant #2',
  'Campus CleanTech E-Waste Processing Facility',
];

export default function VerifyRecycledModal({ item, isOpen, onClose, onSuccess }) {
  const [facility, setFacility] = useState(FACILITIES[0]);
  const [notes, setNotes] = useState('Certified safe green dismantling. PCB gold/copper extracted, plastics pelletized, batteries neutralized.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.recycleItem(item._id || item.id, {
        facility,
        notes,
      });

      if (res.success) {
        onSuccess(res.item);
        onClose();
      } else {
        setError(res.message || 'Failed to verify recycling');
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
            <div className="spacex-caption">// TERMINAL RECOVERY: {item.trackingCode}</div>
            <h2 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider mt-1">
              VERIFY &amp; CERTIFY RECYCLED
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

          {/* Item details */}
          <div className="bg-[#000000] p-4 border border-[#3a3a3f] text-xs space-y-2">
            <div className="flex justify-between">
              <span className="spacex-caption">ITEM CATEGORY:</span>
              <strong className="font-mono text-[#ffffff] uppercase">{item.type}</strong>
            </div>
            <div className="flex justify-between">
              <span className="spacex-caption">NET CERTIFIED MASS:</span>
              <strong className="font-mono text-[#ffffff]">{item.actualWeight || item.approxWeight} KG</strong>
            </div>
            <div className="flex justify-between">
              <span className="spacex-caption">ORIGIN STATION:</span>
              <span className="font-mono text-[#ffffff]">{formatHostel(item.userHostel)} ({item.userName})</span>
            </div>
          </div>

          {/* Facility */}
          <div>
            <label className="block spacex-caption mb-2">
              DISMANTLING &amp; EXTRACTION FACILITY
            </label>
            <select
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              className="w-full px-4 py-3 bg-[#000000] border border-[#3a3a3f] text-[#ffffff] text-xs font-mono focus:border-[#ffffff]"
            >
              {FACILITIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Certification Notes */}
          <div>
            <label className="block spacex-caption mb-2">
              SAFE MATERIAL EXTRACTION CERTIFICATE LOG
            </label>
            <textarea
              rows={3}
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
                <span>ISSUING RECOVERY CERTIFICATE...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ISSUE RECYCLING CERTIFICATE</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

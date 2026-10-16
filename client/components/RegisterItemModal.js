'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import {
  X,
  Upload,
  Camera,
  Laptop,
  Smartphone,
  Zap,
  BatteryCharging,
  Cpu,
  Tv,
  Radio,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const ITEM_TYPES = [
  { label: 'Laptop / Computer', icon: Laptop, defaultWeight: 2.2 },
  { label: 'Mobile Phone / Tablet', icon: Smartphone, defaultWeight: 0.4 },
  { label: 'Charger & Cables', icon: Zap, defaultWeight: 0.3 },
  { label: 'Battery / Power Bank', icon: BatteryCharging, defaultWeight: 0.6 },
  { label: 'Circuit Board / PCB', icon: Cpu, defaultWeight: 1.2 },
  { label: 'Monitor / TV Display', icon: Tv, defaultWeight: 5.5 },
  { label: 'Home Appliance', icon: Radio, defaultWeight: 3.0 },
  { label: 'Other Electronics', icon: HelpCircle, defaultWeight: 1.0 },
];

const SAMPLE_PHOTOS = [
  { name: 'Laptop', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80' },
  { name: 'Phones', url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80' },
  { name: 'Circuit/PCB', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80' },
  { name: 'Display/TV', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80' },
];

export default function RegisterItemModal({ isOpen, onClose, onSuccess, initialItem = null }) {
  const [type, setType] = useState(ITEM_TYPES[0].label);
  const [approxWeight, setApproxWeight] = useState(ITEM_TYPES[0].defaultWeight.toString());
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_PHOTOS[0].url);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Prefill if an item is selected from the 55+ catalog
  React.useEffect(() => {
    if (initialItem && isOpen) {
      setType(initialItem.name || initialItem.category || ITEM_TYPES[0].label);
      setApproxWeight((initialItem.avgWeightKg || 1.0).toString());
      setNotes(`Catalog: ${initialItem.name} (${initialItem.cpcbCategory || 'CPCB Approved'}). Target: ${initialItem.targetUserLabel || 'Campus'}`);
    } else if (isOpen && !initialItem) {
      setType(ITEM_TYPES[0].label);
      setApproxWeight(ITEM_TYPES[0].defaultWeight.toString());
      setNotes('');
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleTypeSelect = (selectedType) => {
    setType(selectedType.label);
    setApproxWeight(selectedType.defaultWeight.toString());
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
    setLoading(true);

    try {
      const res = await api.registerItem({
        type,
        productName: initialItem?.name || type,
        customerType: initialItem?.customerType || 'student',
        approxWeight: parseFloat(approxWeight),
        photoUrl,
        notes,
      });

      if (res.success && res.item) {
        onSuccess(res.item);
        onClose();
      } else {
        setError(res.message || 'Failed to register e-waste item');
      }
    } catch (err) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#0a0a0a] border border-[#3a3a3f] max-w-xl w-full overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-[#3a3a3f] p-6 flex items-center justify-between shrink-0 bg-[#000000]">
          <div>
            <div className="spacex-caption">// SERIALIZED RECOVERY INGESTION</div>
            <h2 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider mt-1">
              REGISTER E-WASTE ITEM
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#5a5a5f] hover:text-[#ffffff] transition-colors p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 border border-[#ffffff] text-[#ffffff] text-xs flex items-center gap-2 bg-[#000000]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-mono">{error}</span>
            </div>
          )}

          {/* Item Category */}
          <div>
            <label className="block spacex-caption mb-3">SELECT HARDWARE CATEGORY</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ITEM_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.label;
                return (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => handleTypeSelect(t)}
                    className={`p-3 border text-left transition-all flex flex-col items-center justify-center gap-2 text-center rounded-none cursor-pointer ${
                      isSelected
                        ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                        : 'border-[#3a3a3f] bg-[#000000] text-[#5a5a5f] hover:text-[#ffffff] hover:border-[#5a5a5f]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] font-['D-DIN-Bold'] uppercase tracking-wider leading-tight">
                      {t.label.split('/')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Approximate Weight */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="spacex-caption">ESTIMATED MASS (KG)</label>
              <span className="spacex-caption text-[#ffffff]">
                YIELD: ~{Math.round((parseFloat(approxWeight) || 0) * 10)} PTS
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
                className="w-full px-4 py-3 bg-[#000000] border border-[#3a3a3f] text-[#ffffff] text-sm focus:border-[#ffffff] font-mono"
              />
              <span className="absolute right-4 top-3 text-xs text-[#5a5a5f] font-mono">KG</span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
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

          {/* Photo Preview / Upload */}
          <div>
            <label className="block spacex-caption mb-2">TELEMETRY TELEPHOTO / PROOF</label>
            <div className="flex gap-4 items-center">
              {photoUrl ? (
                <div className="relative w-24 h-24 border border-[#3a3a3f] shrink-0 bg-[#000000]">
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover grayscale" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute top-1 right-1 p-1 bg-black text-white hover:text-[#ffffff] border border-[#3a3a3f]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="w-24 h-24 border border-dashed border-[#3a3a3f] hover:border-[#ffffff] flex flex-col items-center justify-center cursor-pointer bg-[#000000] text-[#5a5a5f] hover:text-[#ffffff] transition-colors shrink-0">
                  <Upload className="w-5 h-5" />
                  <span className="text-[10px] mt-1 uppercase font-mono">Upload</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}

              <div className="flex-1 space-y-2">
                <p className="spacex-caption text-[11px]">SELECT CALIBRATED REFERENCE OR CAPTURE:</p>
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
                    <Camera className="w-3.5 h-3.5" /> Custom
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Notes / Condition */}
          <div>
            <label className="block spacex-caption mb-2">SUBSYSTEM CONDITION &amp; NOTES (OPTIONAL)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Broken display, swollen cell, included OEM adapter..."
              className="w-full px-4 py-3 text-xs bg-[#000000] border border-[#3a3a3f] text-[#f0f0fa] focus:border-[#ffffff]"
            />
          </div>

          <div className="pt-4 border-t border-[#3a3a3f]">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-spacex py-3"
            >
              {loading ? (
                <span>INITIALIZING DIGITAL PASSPORT...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>GENERATE QR PASSPORT &amp; REGISTER</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { X, Calendar, MapPin, Clock, CheckCircle2, AlertCircle, Building } from 'lucide-react';

const TIME_SLOTS = [
  'Morning Slot (09:00 AM - 12:00 PM)',
  'Afternoon Slot (02:00 PM - 05:00 PM)',
  'Evening Slot (05:00 PM - 07:30 PM)',
];

const DROP_LOCATIONS = [
  'Hostel Room Doorstep Pickup',
  'Hostel Reception / Security Desk',
  'Central Campus E-Waste Kiosk (SAC)',
  'Library Ground Floor Drop Box',
  'Academic Complex Tech Hub',
];

export default function SchedulePickupModal({ item, isOpen, onClose, onSuccess }) {
  const [pickupDate, setPickupDate] = useState('');
  const [minDate, setMinDate] = useState('');
  const [slot, setSlot] = useState(TIME_SLOTS[0]);
  const [locationType, setLocationType] = useState(DROP_LOCATIONS[0]);
  const [roomNumber, setRoomNumber] = useState(item?.location || 'Room 204');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const today = new Date();
    setMinDate(today.toISOString().split('T')[0]);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPickupDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fullLocation =
      locationType === 'Hostel Room Doorstep Pickup'
        ? `Hostel ${item.userHostel || ''} - ${roomNumber}`
        : `${locationType} (${roomNumber})`;

    const combinedDate = `${pickupDate} (${slot})`;

    try {
      const res = await api.schedulePickup(item._id || item.id, {
        pickupDate: combinedDate,
        location: fullLocation,
        notes,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to schedule pickup');
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
            <div className="spacex-caption">// LOGISTICS DISPATCH: {item.trackingCode}</div>
            <h2 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider mt-1">
              SCHEDULE RECOVERY SLOT
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

          {/* Date */}
          <div>
            <label className="block spacex-caption mb-2">TARGET CALENDAR DATE</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#5a5a5f] absolute left-3 top-3.5" />
              <input
                type="date"
                required
                min={minDate || undefined}
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-[#000000] border border-[#3a3a3f] text-[#ffffff] text-sm font-mono focus:border-[#ffffff]"
              />
            </div>
          </div>

          {/* Time Slot */}
          <div>
            <label className="block spacex-caption mb-2">TARGET TIME WINDOW</label>
            <div className="relative">
              <Clock className="w-4 h-4 text-[#5a5a5f] absolute left-3 top-3.5" />
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="w-full pl-9 pr-3 py-3 bg-[#000000] border border-[#3a3a3f] text-[#ffffff] text-xs font-mono focus:border-[#ffffff]"
              >
                {TIME_SLOTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Mode */}
          <div>
            <label className="block spacex-caption mb-2">PICKUP OR CONSOLIDATION POINT</label>
            <div className="relative">
              <Building className="w-4 h-4 text-[#5a5a5f] absolute left-3 top-3.5" />
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                className="w-full pl-9 pr-3 py-3 bg-[#000000] border border-[#3a3a3f] text-[#ffffff] text-xs font-mono focus:border-[#ffffff]"
              >
                {DROP_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Room / Desk Details */}
          <div>
            <label className="block spacex-caption mb-2">
              ROOM / BAY / SPECIFIC LANDMARK
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#5a5a5f] absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Room 304, 3rd Floor East Wing"
                className="w-full pl-9 pr-3 py-3 bg-[#000000] border border-[#3a3a3f] text-[#ffffff] text-xs font-mono focus:border-[#ffffff]"
              />
            </div>
          </div>

          {/* Special instructions */}
          <div>
            <label className="block spacex-caption mb-2">LOGISTICS TELEMETRY NOTES (OPTIONAL)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Heavy server chassis, accessible at loading dock..."
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
                <span>SCHEDULING DISPATCH WINDOW...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CONFIRM RECOVERY SLOT</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  Filter,
  QrCode,
  Scale,
  Truck,
  Building,
  Recycle,
  Check,
  Clock,
  Calendar,
  FileText,
} from 'lucide-react';
import { formatHostel, formatLocation } from '@/lib/formatHostel';

const STATUS_FILTERS = [
  { key: 'all', label: 'All Items' },
  { key: 'registered', label: 'Registered' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'collected', label: 'Collected' },
  { key: 'handed_over', label: 'Handed Over' },
  { key: 'verified_recycled', label: 'Verified Recycled' },
];

const HOSTELS = ['all', 'Nandani', 'Kaveri', 'Kumardhara', 'Saupernikha', 'Shambhavi', 'Netravati', 'Yourspace'];

export default function RequestsTable({
  items = [],
  loading,
  onOpenScanner,
  onOpenCollect,
  onOpenHandover,
  onOpenRecycle,
  onOpenTracker,
  onOpenQr,
}) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hostelFilter, setHostelFilter] = useState('all');

  const filteredItems = items.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (hostelFilter !== 'all' && item.userHostel !== hostelFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        item.trackingCode.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.userName?.toLowerCase().includes(q) ||
        item.userHostel?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-10">
      {/* Operations Header */}
      <div className="border-b border-[#3a3a3f] pb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="spacex-caption mb-2">// LOGISTICS CONTROL</div>
          <h1 className="font-['D-DIN-Bold'] text-3xl sm:text-5xl font-black text-[#ffffff] uppercase tracking-tight">
            CAMPUS OPERATIONS HUB
          </h1>
          <p className="text-[#5a5a5f] text-sm mt-2 max-w-xl">
            Real-time movement ledger across hostels, sorting depots, and certified recycler handovers.
          </p>
        </div>

        <Link href="/scan" className="btn-spacex">
          <QrCode className="w-3.5 h-3.5" />
          <span>Launch Scanner</span>
        </Link>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SEARCH BY TRACKING CODE, USER, HARDWARE TYPE..."
              className="w-full px-4 py-3"
            />
          </div>

          <div className="w-full sm:w-64">
            <select
              value={hostelFilter}
              onChange={(e) => setHostelFilter(e.target.value)}
              className="w-full px-4 py-3"
            >
              {HOSTELS.map((h) => (
                <option key={h} value={h}>
                  {h === 'all' ? 'ALL STATIONS' : (h === 'Yourspace' ? 'STATION: YOURSPACE' : `STATION: ${h.toUpperCase()}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Track */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#3a3a3f] pb-3">
          {STATUS_FILTERS.map((s) => {
            const count = s.key === 'all' ? items.length : items.filter((i) => i.status === s.key).length;
            const isSelected = statusFilter === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setStatusFilter(s.key)}
                className={`px-4 py-1.5 text-xs font-['D-DIN-Bold'] uppercase tracking-[1.17px] whitespace-nowrap transition-all rounded-full border cursor-pointer ${
                  isSelected
                    ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                    : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff] hover:border-[#3a3a3f]'
                }`}
              >
                <span>{s.label}</span>
                <span className="ml-1.5 opacity-60">[{count}]</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manifest Table */}
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>ID & CATEGORY</th>
              <th>OPERATOR & STATION</th>
              <th>WEIGHT TELEMETRY</th>
              <th>STATUS / DISPATCH</th>
              <th style={{ textAlign: 'right' }}>COMMANDS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-24 text-center">
                  <span className="spacex-caption animate-pulse">POLLING LOGISTICS MANIFEST...</span>
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-24 text-center">
                  <div className="spacex-caption">// ZERO ITEMS MATCHING FILTER</div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item._id || item.trackingCode}>
                  <td>
                    <div className="font-mono text-xs font-bold text-[#ffffff] uppercase tracking-wider">
                      {item.trackingCode}
                    </div>
                    <div className="text-sm font-semibold text-[#f0f0fa] mt-0.5">{item.type}</div>
                  </td>

                  <td>
                    <div className="text-xs text-[#ffffff] font-semibold">{item.userName || 'Student'}</div>
                    <div className="spacex-caption text-[11px] mt-0.5">{formatHostel(item.userHostel)}</div>
                  </td>

                  <td>
                    <div className="font-mono text-sm text-[#ffffff]">
                      {item.actualWeight ? `${item.actualWeight} kg` : `~${item.approxWeight} kg`}
                    </div>
                    <div className="spacex-caption text-[10px]">
                      {item.actualWeight ? 'VERIFIED' : 'DECLARED'}
                    </div>
                  </td>

                  <td>
                    <span className="font-mono text-xs uppercase tracking-wider text-[#ffffff] border border-[#3a3a3f] px-2.5 py-1 inline-block">
                      [{item.status.replace('_', ' ')}]
                    </span>
                    <div className="spacex-caption text-[11px] mt-1 truncate max-w-[200px]">
                      {item.pickupDate || formatLocation(item.location, item.userHostel)}
                    </div>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div className="inline-flex items-center gap-2 justify-end">
                      {['registered', 'scheduled'].includes(item.status) && (
                        <button
                          onClick={() => onOpenCollect(item)}
                          className="btn-spacex py-1 px-3 text-[11px]"
                        >
                          <Scale className="w-3 h-3" />
                          <span>Weigh</span>
                        </button>
                      )}

                      {item.status === 'collected' && (
                        <button
                          onClick={() => onOpenHandover(item)}
                          className="btn-spacex py-1 px-3 text-[11px]"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Handover</span>
                        </button>
                      )}

                      {item.status === 'handed_over' && (
                        <button
                          onClick={() => onOpenRecycle(item)}
                          className="btn-spacex py-1 px-3 text-[11px]"
                        >
                          <Recycle className="w-3 h-3" />
                          <span>Dismantle</span>
                        </button>
                      )}

                      <button
                        onClick={() => onOpenQr(item)}
                        className="btn-spacex py-1 px-2.5 text-[11px]"
                        title="QR Sticker"
                      >
                        <QrCode className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onOpenTracker(item._id || item.id)}
                        className="btn-spacex py-1 px-2.5 text-[11px]"
                        title="Audit Trail"
                      >
                        <FileText className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

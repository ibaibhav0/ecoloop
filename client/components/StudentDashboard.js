'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Plus,
  QrCode,
  Calendar,
  Clock,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { formatLocation } from '@/lib/formatHostel';

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

  const totalRegistered = items.length;
  const scheduledCount = items.filter((i) => i.status === 'scheduled').length;
  const completedCount = items.filter((i) => i.status === 'verified_recycled').length;
  const collectedCount = items.filter((i) => ['collected', 'handed_over', 'verified_recycled'].includes(i.status)).length;
  const totalKg = items.reduce((acc, curr) => acc + (curr.actualWeight || curr.approxWeight || 0), 0);

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

                        <button
                          onClick={() => onOpenQr(item)}
                          className="btn-spacex py-1 px-3 text-[11px]"
                          title="Passport QR"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>Tag</span>
                        </button>

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
    </div>
  );
}

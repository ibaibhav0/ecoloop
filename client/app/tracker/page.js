'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import StatusTrackerModal from '@/components/StatusTrackerModal';
import QrDisplayModal from '@/components/QrDisplayModal';
import SchedulePickupModal from '@/components/SchedulePickupModal';
import {
  Recycle,
  Scale,
  Truck,
  CheckCircle2,
  QrCode,
  ArrowLeft,
  Calendar,
  LogOut,
  Plus,
} from 'lucide-react';
import { formatHostel, formatLocation } from '@/lib/formatHostel';

export default function StudentStatusTrackerPage() {
  const { user, logout } = useAuth();

  const [items, setItems] = useState([]);
  const [leaderboard, setLeaderboard] = useState({ hostelRankings: [], topStudents: [] });
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedItemIdForAudit, setSelectedItemIdForAudit] = useState(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedItemForQr, setSelectedItemForQr] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedItemForSchedule, setSelectedItemForSchedule] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, leaderboardRes] = await Promise.all([
        api.getItems(),
        api.getLeaderboard(),
      ]);

      if (itemsRes.success && itemsRes.items) {
        setItems(itemsRes.items);
      }
      if (leaderboardRes.success) {
        setLeaderboard(leaderboardRes);
      }
    } catch (e) {
      console.warn('Error fetching tracker data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, user?.role, user?.id]);

  const totalPoints = user?.points || 0;
  const verifiedCollectedCount = items.filter((i) =>
    ['collected', 'handed_over', 'verified_recycled'].includes(i.status)
  ).length;
  const verifiedRecycledCount = items.filter((i) => i.status === 'verified_recycled').length;
  const totalKg = items.reduce(
    (acc, curr) => acc + (curr.actualWeight || curr.approxWeight || 0),
    0
  );

  const studentHostel = user?.hostel || 'Nandani';
  const hostelRankings = leaderboard.hostelRankings || [];
  const studentHostelRankIndex = hostelRankings.findIndex((h) => h.hostel === studentHostel);
  const currentHostelRank = studentHostelRankIndex !== -1 ? studentHostelRankIndex + 1 : 1;

  return (
    <div className="min-h-screen bg-[#000000] text-[#f0f0fa] flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-[#000000] py-4 px-6 border-b border-[#3a3a3f] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = '/';
              }
            }}
            className="btn-spacex"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-4">
            <Link href="/register" className="btn-spacex">
              <Plus className="w-3.5 h-3.5" />
              <span>Register E-Waste</span>
            </Link>
            {logout && (
              <button
                onClick={logout}
                className="text-[#5a5a5f] hover:text-[#ffffff] text-xs font-bold uppercase transition"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b border-[#3a3a3f] px-6 py-12 bg-[#000000]">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="spacex-caption">// OPERATOR DOSSIER: {user?.name || 'STUDENT'} // STATION: {studentHostel}</div>
          <h1 className="font-['D-DIN-Bold'] text-4xl sm:text-6xl font-black text-[#ffffff] uppercase tracking-tight leading-[0.95]">
            ASSET LIFECYCLE TRACKER
          </h1>
          <p className="text-base text-[#f0f0fa] max-w-2xl leading-relaxed">
            Cryptographic ledger monitoring of your decommissioned hardware from registration through campus collection and terminal CPCB material extraction.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-[#3a3a3f] mt-8">
            <div className="border border-[#3a3a3f] p-6 bg-[#0a0a0a]">
              <span className="spacex-caption block">CREDITS BALANCE</span>
              <div className="font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff] mt-2">
                {totalPoints} <span className="text-xs font-mono text-[#5a5a5f]">PTS</span>
              </div>
              <p className="text-xs font-mono text-[#5a5a5f] mt-1">10 PTS / KG VERIFIED</p>
            </div>

            <div className="border border-[#3a3a3f] p-6 bg-[#0a0a0a]">
              <span className="spacex-caption block">TOTAL MASS DIVERTED</span>
              <div className="font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff] mt-2">
                {totalKg.toFixed(1)} <span className="text-xs font-mono text-[#5a5a5f]">KG</span>
              </div>
              <p className="text-xs font-mono text-[#5a5a5f] mt-1">{verifiedCollectedCount} WEIGHED</p>
            </div>

            <div className="border border-[#3a3a3f] p-6 bg-[#0a0a0a]">
              <span className="spacex-caption block">STATION RANKING</span>
              <div className="font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff] mt-2">
                #{currentHostelRank}
              </div>
              <p className="text-xs font-mono text-[#5a5a5f] mt-1 uppercase">STATION {studentHostel}</p>
            </div>

            <div className="border border-[#3a3a3f] p-6 bg-[#0a0a0a]">
              <span className="spacex-caption block">VERIFIED RECYCLED</span>
              <div className="font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff] mt-2">
                {verifiedRecycledCount}
              </div>
              <p className="text-xs font-mono text-[#5a5a5f] mt-1 uppercase">SAFE DISMANTLE COMPLETE</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Table Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 space-y-12 w-full">
        <section className="space-y-6">
          <div className="border-b border-[#3a3a3f] pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-['D-DIN-Bold'] text-2xl uppercase tracking-wider text-[#ffffff]">
                ENROLLED HARDWARE PASSPORTS ({items.length})
              </h2>
              <span className="spacex-caption">LIVE CRYPTOGRAPHIC TELEMETRY LEDGER</span>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-[#5a5a5f] font-mono text-xs">
              <p className="spacex-caption">POLLING PASSPORT LEDGER...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="border border-[#3a3a3f] p-12 text-center space-y-4">
              <p className="spacex-caption">NO ASSETS ENROLLED FOR THIS OPERATOR.</p>
              <Link href="/register" className="btn-spacex">
                <span>REGISTER FIRST E-WASTE ITEM</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>TRACKING CODE</th>
                    <th>HARDWARE SPECIFICATION</th>
                    <th>APPROX MASS</th>
                    <th>CURRENT STATUS</th>
                    <th>LOCATION / STATION</th>
                    <th className="text-right">TELEMETRY</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id || item.trackingCode}>
                      <td className="font-mono text-xs font-bold text-[#ffffff]">{item.trackingCode}</td>
                      <td className="font-['D-DIN-Bold'] text-sm uppercase text-[#ffffff]">{item.type}</td>
                      <td className="font-mono text-xs text-[#f0f0fa]">{item.actualWeight || item.approxWeight} KG</td>
                      <td>
                        <span className="font-mono text-xs uppercase text-[#ffffff] border border-[#3a3a3f] px-2 py-0.5">
                          {item.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-[#5a5a5f]">{formatLocation(item.location, item.userHostel)}</td>
                      <td className="text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedItemIdForAudit(item._id || item.id);
                            setIsAuditModalOpen(true);
                          }}
                          className="btn-spacex py-1 px-3 text-[11px]"
                        >
                          AUDIT LOG
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItemForQr(item);
                            setIsQrModalOpen(true);
                          }}
                          className="btn-spacex btn-spacex-muted py-1 px-3 text-[11px]"
                        >
                          QR TAG
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* MODALS */}
        <StatusTrackerModal
          itemId={selectedItemIdForAudit}
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          onViewQr={(item) => {
            setSelectedItemForQr(item);
            setIsQrModalOpen(true);
          }}
        />

        <QrDisplayModal
          item={selectedItemForQr}
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          onSchedule={(item) => {
            setSelectedItemForSchedule(item);
            setIsScheduleModalOpen(true);
          }}
        />

        <SchedulePickupModal
          item={selectedItemForSchedule}
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSuccess={loadData}
        />
      </main>
    </div>
  );
}

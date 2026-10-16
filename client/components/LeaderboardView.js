'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Award, Trophy, Medal, Building, Sparkles } from 'lucide-react';

export default function LeaderboardView() {
  const [data, setData] = useState({ hostelRankings: [], topStudents: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getLeaderboard()
      .then((res) => {
        if (res.success) {
          setData(res);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const { hostelRankings = [], topStudents = [] } = data;
  const hasAnyActivity = hostelRankings.some((h) => (h.totalPoints || 0) > 0 || (h.totalKg || 0) > 0);

  return (
    <div className="space-y-16">
      {/* Banner */}
      <section className="border-b border-[#3a3a3f] pb-12">
        <div className="spacex-caption mb-3">// STATION COMPETITIVE TELEMETRY</div>
        <h1 className="font-['D-DIN-Bold'] text-4xl sm:text-6xl font-black text-[#ffffff] tracking-tight uppercase leading-[0.95]">
          CAMPUS STATION STANDINGS
        </h1>
        <p className="text-[#f0f0fa] text-base mt-4 max-w-2xl leading-relaxed">
          Operational yields across campus hostel clusters and research halls. Standings calibrated at strictly 10 reward credits per certified kilogram of diverted electronics.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-8 border-t border-[#3a3a3f]">
          <div>
            <div className="spacex-caption">CREDIT PROTOCOL</div>
            <div className="font-['D-DIN-Bold'] text-3xl font-bold text-[#ffffff] mt-2">
              10 <span className="text-sm font-normal text-[#5a5a5f]">PTS / KG</span>
            </div>
            <p className="text-xs text-[#5a5a5f] mt-1 uppercase">CALIBRATED ON-SCALE</p>
          </div>
          <div>
            <div className="spacex-caption">ACTIVE SECTORS</div>
            <div className="font-['D-DIN-Bold'] text-3xl font-bold text-[#ffffff] mt-2">
              {hostelRankings.length}
            </div>
            <p className="text-xs text-[#5a5a5f] mt-1 uppercase">HOSTELS &amp; LAB BAYS</p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="p-16 text-center text-[#5a5a5f] font-mono text-xs">
          <p className="spacex-caption">CALIBRATING CAMPUS STANDINGS...</p>
        </div>
      ) : (
        <>
          {/* Top 3 Metric Standings */}
          {hasAnyActivity && hostelRankings.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-[#3a3a3f] pb-12">
              {/* 1st Place */}
              <div className="border border-[#ffffff] bg-[#0a0a0a] p-6 text-left">
                <span className="spacex-caption text-[#ffffff]">// 01 FIRST RANK // STATION LEADER</span>
                <h3 className="font-['D-DIN-Bold'] text-2xl font-bold text-[#ffffff] mt-2 uppercase">
                  STATION {hostelRankings[0].hostel}
                </h3>
                <div className="mt-4 font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff]">
                  {hostelRankings[0].totalPoints} <span className="text-sm font-mono text-[#5a5a5f]">PTS</span>
                </div>
                <p className="text-xs font-mono text-[#5a5a5f] mt-2 uppercase">
                  {hostelRankings[0].totalKg} KG DIVERTED • {hostelRankings[0].itemsCount} ASSETS
                </p>
              </div>

              {/* 2nd Place */}
              <div className="border border-[#3a3a3f] bg-[#000000] p-6 text-left">
                <span className="spacex-caption">// 02 SECOND RANK</span>
                <h3 className="font-['D-DIN-Bold'] text-2xl font-bold text-[#ffffff] mt-2 uppercase">
                  STATION {hostelRankings[1].hostel}
                </h3>
                <div className="mt-4 font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff]">
                  {hostelRankings[1].totalPoints} <span className="text-sm font-mono text-[#5a5a5f]">PTS</span>
                </div>
                <p className="text-xs font-mono text-[#5a5a5f] mt-2 uppercase">
                  {hostelRankings[1].totalKg} KG DIVERTED • {hostelRankings[1].itemsCount} ASSETS
                </p>
              </div>

              {/* 3rd Place */}
              <div className="border border-[#3a3a3f] bg-[#000000] p-6 text-left">
                <span className="spacex-caption">// 03 THIRD RANK</span>
                <h3 className="font-['D-DIN-Bold'] text-2xl font-bold text-[#ffffff] mt-2 uppercase">
                  STATION {hostelRankings[2].hostel}
                </h3>
                <div className="mt-4 font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff]">
                  {hostelRankings[2].totalPoints} <span className="text-sm font-mono text-[#5a5a5f]">PTS</span>
                </div>
                <p className="text-xs font-mono text-[#5a5a5f] mt-2 uppercase">
                  {hostelRankings[2].totalKg} KG DIVERTED • {hostelRankings[2].itemsCount} ASSETS
                </p>
              </div>
            </div>
          )}

          {/* Full Hostel Rankings Table */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-4">
              <div>
                <h2 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider">
                  ALL STATION TELEMETRY
                </h2>
                <span className="spacex-caption">VERIFIED AUDIT LOG</span>
              </div>
              <span className="spacex-caption">{hostelRankings.length} STATIONS MONITORED</span>
            </div>

            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>RANK</th>
                    <th>STATION / CLUSTER</th>
                    <th className="text-right">REWARD CREDITS</th>
                    <th className="text-right">MASS DIVERTED</th>
                    <th className="text-right">ASSETS SERIALIZED</th>
                    <th className="text-right">ENROLLED OPERATORS</th>
                  </tr>
                </thead>
                <tbody>
                  {hostelRankings.map((h, index) => (
                    <tr key={h.hostel}>
                      <td className="font-mono text-[#ffffff]">#{index + 1}</td>
                      <td className="font-['D-DIN-Bold'] text-sm uppercase text-[#ffffff]">STATION {h.hostel}</td>
                      <td className="text-right font-mono font-bold text-[#ffffff]">{h.totalPoints} PTS</td>
                      <td className="text-right font-mono text-[#f0f0fa]">{h.totalKg} KG</td>
                      <td className="text-right font-mono text-[#5a5a5f]">{h.itemsCount}</td>
                      <td className="text-right font-mono text-[#5a5a5f]">{h.studentCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Top Individual Student Recyclers */}
          <section className="space-y-6 border-t border-[#3a3a3f] pt-12">
            <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-4">
              <div>
                <h2 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider">
                  INDIVIDUAL OPERATOR HONOR ROLL
                </h2>
                <span className="spacex-caption">TOP RECOVERY CONTRIBUTORS</span>
              </div>
            </div>

            {topStudents.length === 0 ? (
              <p className="spacex-caption">NO RECOVERY CREDITS RECORDED YET.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topStudents.map((s, i) => (
                  <div
                    key={s.id || s.name}
                    className="p-5 border border-[#3a3a3f] bg-[#000000] flex items-center justify-between hover:border-[#ffffff] transition-colors"
                  >
                    <div>
                      <span className="spacex-caption text-[10px]">#{i + 1} // OPERATOR</span>
                      <p className="font-['D-DIN-Bold'] text-base uppercase text-[#ffffff] mt-1">{s.name}</p>
                      <p className="text-xs font-mono text-[#5a5a5f]">STATION {s.hostel}</p>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-['D-DIN-Bold'] text-2xl text-[#ffffff]">{s.points}</span>
                      <span className="text-[10px] text-[#5a5a5f] block uppercase">PTS</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

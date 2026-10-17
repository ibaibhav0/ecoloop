'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Award, Trophy, Medal, Building, Sparkles, Gift, GiftIcon, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function LeaderboardView() {
  const [data, setData] = useState({ hostelRankings: [], branchRankings: [], topStudents: [] });
  const [activeTab, setActiveTab] = useState('branch'); // 'branch' or 'hostel'
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

  const { hostelRankings = [], branchRankings = [], topStudents = [] } = data;
  const hasAnyActivity = hostelRankings.some((h) => (h.totalPoints || 0) > 0 || (h.totalKg || 0) > 0);

  return (
    <div className="space-y-16">
      {/* Banner */}
      <section className="border-b border-[#3a3a3f] pb-12">
        <div className="spacex-caption mb-3">// CAMPUS COMPETITIVE SCOREBOARD</div>
        <h1 className="font-['D-DIN-Bold'] text-4xl sm:text-6xl font-black text-[#ffffff] tracking-tight uppercase leading-[0.95]">
          BRANCH &amp; HOSTEL STANDINGS
        </h1>
        <p className="text-[#f0f0fa] text-base mt-4 max-w-2xl leading-relaxed">
          Real-time circularity leaderboard across academic departments and residential hostels. Verified at 10 reward credits per certified kilogram with monthly Amazon Gift Card incentives.
        </p>

        {/* MONTHLY REWARDS & AMAZON GIFT CARDS SHOWCASE */}
        <div className="mt-8 p-6 bg-[#0a0a0c] border-2 border-[#ffffff] relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#27272a] pb-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" />
                <span className="font-['D-DIN-Bold'] text-xl text-white uppercase tracking-wider">
                  MONTHLY CHAMPIONSHIP: AMAZON GIFT CARDS &amp; COOL GOODIES
                </span>
              </div>
              <p className="text-xs text-[#a1a1aa] font-mono mt-1">
                At the end of each calendar month, the highest-scoring individual recyclers and the #1 department receive official prizes:
              </p>
            </div>
            <div className="px-3 py-1.5 bg-[#ffffff] text-[#000000] font-mono text-xs font-bold uppercase tracking-wider shrink-0">
              OCTOBER CYCLE ACTIVE
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1st Prize */}
            <div className="p-4 bg-[#000000] border-2 border-amber-400/80 space-y-2 relative">
              <span className="text-[10px] font-mono uppercase bg-amber-400 text-black font-bold px-2 py-0.5 inline-block">
                🥇 1ST PLACE WINNER
              </span>
              <h4 className="font-['D-DIN-Bold'] text-lg text-white uppercase mt-1">
                ₹2,500 AMAZON GIFT CARD
              </h4>
              <p className="text-xs text-[#a1a1aa] font-mono">
                + Official EcoLoop Tech Hoodie &amp; Stainless Steel Smart Tumbler + Winner Trophy.
              </p>
            </div>

            {/* 2nd Prize */}
            <div className="p-4 bg-[#000000] border border-[#ffffff]/40 space-y-2">
              <span className="text-[10px] font-mono uppercase bg-white/20 text-white font-bold px-2 py-0.5 inline-block">
                🥈 2ND PLACE WINNER
              </span>
              <h4 className="font-['D-DIN-Bold'] text-lg text-white uppercase mt-1">
                ₹1,500 AMAZON GIFT CARD
              </h4>
              <p className="text-xs text-[#a1a1aa] font-mono">
                + Solar 20,000mAh Power Bank &amp; EcoLoop Campus Tech Backpack.
              </p>
            </div>

            {/* 3rd Prize */}
            <div className="p-4 bg-[#000000] border border-[#ffffff]/40 space-y-2">
              <span className="text-[10px] font-mono uppercase bg-white/20 text-white font-bold px-2 py-0.5 inline-block">
                🥉 3RD PLACE WINNER
              </span>
              <h4 className="font-['D-DIN-Bold'] text-lg text-white uppercase mt-1">
                ₹1,000 AMAZON GIFT CARD
              </h4>
              <p className="text-xs text-[#a1a1aa] font-mono">
                + Noise-Cancelling Wireless Earbuds &amp; Campus Champion Merch Kit.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-10 pt-8 border-t border-[#3a3a3f]">
          <div>
            <div className="spacex-caption">CREDIT PROTOCOL</div>
            <div className="font-['D-DIN-Bold'] text-3xl font-bold text-[#ffffff] mt-2">
              10 <span className="text-sm font-normal text-[#5a5a5f]">PTS / KG</span>
            </div>
            <p className="text-xs text-[#5a5a5f] mt-1 uppercase">CALIBRATED ON-SCALE</p>
          </div>
          <div>
            <div className="spacex-caption">ACTIVE BRANCHES</div>
            <div className="font-['D-DIN-Bold'] text-3xl font-bold text-[#ffffff] mt-2">
              {branchRankings.length || 7}
            </div>
            <p className="text-xs text-[#5a5a5f] mt-1 uppercase">ENGINEERING SECTORS</p>
          </div>
          <div>
            <div className="spacex-caption">RESIDENTIAL STATIONS</div>
            <div className="font-['D-DIN-Bold'] text-3xl font-bold text-[#ffffff] mt-2">
              {hostelRankings.length || 6}
            </div>
            <p className="text-xs text-[#5a5a5f] mt-1 uppercase">HOSTEL CLUSTERS</p>
          </div>
          <div>
            <div className="spacex-caption">HANDOVER AUTH</div>
            <div className="font-['D-DIN-Bold'] text-3xl font-bold text-[#ffffff] mt-2">
              4-DIGIT
            </div>
            <p className="text-xs text-[#5a5a5f] mt-1 uppercase">PHYSICAL OTP VERIFIED</p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="p-16 text-center text-[#5a5a5f] font-mono text-xs">
          <p className="spacex-caption">CALIBRATING CAMPUS STANDINGS...</p>
        </div>
      ) : (
        <>
          {/* Dual Toggle: Branch vs Hostel */}
          <div className="flex items-center gap-4 border-b border-[#3a3a3f] pb-4">
            <button
              onClick={() => setActiveTab('branch')}
              className={`pb-2 font-['D-DIN-Bold'] text-lg uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'branch'
                  ? 'border-[#ffffff] text-[#ffffff]'
                  : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff]'
              }`}
            >
              Academic Branch Leaderboard ({branchRankings.length})
            </button>
            <span className="text-[#3a3a3f]">|</span>
            <button
              onClick={() => setActiveTab('hostel')}
              className={`pb-2 font-['D-DIN-Bold'] text-lg uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'hostel'
                  ? 'border-[#ffffff] text-[#ffffff]'
                  : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff]'
              }`}
            >
              Residential Hostel Standings ({hostelRankings.length})
            </button>
          </div>

          {/* SECTION 1: BRANCH / DEPARTMENT RANKINGS */}
          {activeTab === 'branch' && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-4">
                <div>
                  <h2 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider">
                    ACADEMIC BRANCH &amp; DEPARTMENT STANDINGS
                  </h2>
                  <span className="spacex-caption">NITTE DEEMED TO BE UNIVERSITY // DEPT SHIELD 2026</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>RANK</th>
                      <th>ACADEMIC BRANCH / DEPARTMENT</th>
                      <th className="text-right">CREDITS BALANCE</th>
                      <th className="text-right">CALIBRATED MASS</th>
                      <th className="text-right">ASSETS RECLAIMED</th>
                      <th className="text-right">STUDENTS ENROLLED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branchRankings.map((b, index) => (
                      <tr key={b.branch}>
                        <td className="font-mono text-[#ffffff]">#{index + 1}</td>
                        <td className="font-['D-DIN-Bold'] text-sm uppercase text-[#ffffff]">
                          {b.branch}
                          {index === 0 && (
                            <span className="ml-2 text-[10px] bg-amber-400 text-black px-1.5 py-0.5 font-mono font-bold">
                              #1 SHIELD LEADER
                            </span>
                          )}
                        </td>
                        <td className="text-right font-mono font-bold text-[#ffffff]">{b.totalPoints} PTS</td>
                        <td className="text-right font-mono text-[#f0f0fa]">{b.totalKg} KG</td>
                        <td className="text-right font-mono text-[#5a5a5f]">{b.itemsCount}</td>
                        <td className="text-right font-mono text-[#5a5a5f]">{b.studentCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* SECTION 2: HOSTEL RANKINGS */}
          {activeTab === 'hostel' && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-4">
                <div>
                  <h2 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider">
                    RESIDENTIAL HOSTEL RECOVERY STANDINGS
                  </h2>
                  <span className="spacex-caption">NITTE CAMPUS RESIDENTIAL SECTORS</span>
                </div>
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
          )}

          {/* SECTION 3: TOP STUDENT RECYCLERS (MONTHLY PRIZE ELIGIBLE) */}
          <section className="space-y-6 border-t border-[#3a3a3f] pt-12">
            <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-4">
              <div>
                <h2 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider">
                  TOP STUDENT OPERATORS (MONTHLY PRIZE RANKINGS)
                </h2>
                <span className="spacex-caption">QUALIFIED FOR AMAZON GIFT CARDS &amp; TECH GOODIES</span>
              </div>
            </div>

            {topStudents.length === 0 ? (
              <p className="spacex-caption">NO RECOVERY CREDITS RECORDED YET. SUBMIT HARDWARE WITH 4-DIGIT OTP TO COMPETE!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topStudents.map((s, i) => {
                  const prizeTag =
                    i === 0
                      ? '🥇 ₹2,500 AMAZON CARD'
                      : i === 1
                      ? '🥈 ₹1,500 AMAZON CARD'
                      : i === 2
                      ? '🥉 ₹1,000 AMAZON CARD'
                      : 'CERTIFIED RECYCLER';

                  return (
                    <div
                      key={s.id || s.name}
                      className={`p-5 border bg-[#000000] flex items-center justify-between transition-colors ${
                        i === 0 ? 'border-amber-400' : 'border-[#3a3a3f] hover:border-[#ffffff]'
                      }`}
                    >
                      <div>
                        <span className="spacex-caption text-[10px]">#{i + 1} // {prizeTag}</span>
                        <p className="font-['D-DIN-Bold'] text-base uppercase text-[#ffffff] mt-1">{s.name}</p>
                        <p className="text-xs font-mono text-[#5a5a5f]">{s.department || s.hostel}</p>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-['D-DIN-Bold'] text-2xl text-[#ffffff]">{s.points}</span>
                        <span className="text-[10px] text-[#5a5a5f] block uppercase">PTS</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

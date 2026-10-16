'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function AnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAnalyticsSummary()
      .then((res) => {
        if (res.success) {
          setData(res.stats);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-16 text-center text-[#5a5a5f] font-mono text-xs">
        <p className="spacex-caption">AGGREGATING CAMPUS TELEMETRIC FOOTPRINT...</p>
      </div>
    );
  }

  const {
    totalItems = 0,
    totalKg = 0,
    collectedKg = 0,
    statusCounts = {},
    hostelStats = [],
    typeBreakdown = {},
    impact = {},
  } = data || {};

  return (
    <div className="space-y-16">
      {/* Header */}
      <section className="border-b border-[#3a3a3f] pb-12">
        <div className="spacex-caption mb-3">// ECOLOGICAL MASS DIVERSION TELEMETRY</div>
        <h1 className="font-['D-DIN-Bold'] text-4xl sm:text-6xl font-black text-[#ffffff] tracking-tight uppercase leading-[0.95]">
          E-WASTE DIVERSION ANALYTICS
        </h1>
        <p className="text-[#f0f0fa] text-base mt-4 max-w-2xl leading-relaxed">
          Statutory CPCB 2022 compliance metrics, certified circular recovery kilograms, and hazardous chemical diversion accounting across all active campus clusters.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-8 border-t border-[#3a3a3f]">
          <div>
            <div className="spacex-caption">NET RECOVERED MASS</div>
            <div className="font-['D-DIN-Bold'] text-3xl sm:text-5xl font-bold text-[#ffffff] mt-2">
              {totalKg} <span className="text-sm font-normal text-[#5a5a5f]">KG</span>
            </div>
            <p className="text-xs text-[#5a5a5f] mt-1 uppercase font-mono">{totalItems} DIGITAL PASSPORTS</p>
          </div>

          <div>
            <div className="spacex-caption">VERIFIED COLLECTED</div>
            <div className="font-['D-DIN-Bold'] text-3xl sm:text-5xl font-bold text-[#ffffff] mt-2">
              {collectedKg} <span className="text-sm font-normal text-[#5a5a5f]">KG</span>
            </div>
            <p className="text-xs text-[#5a5a5f] mt-1 uppercase font-mono">
              {totalKg > 0 ? `${Math.round((collectedKg / totalKg) * 100)}% YIELD` : '0%'}
            </p>
          </div>

          <div>
            <div className="spacex-caption">CO2 EMISSIONS AVOIDED</div>
            <div className="font-['D-DIN-Bold'] text-3xl sm:text-5xl font-bold text-[#ffffff] mt-2">
              {impact.co2SavedKg || 0} <span className="text-sm font-normal text-[#5a5a5f]">KG CO2E</span>
            </div>
            <p className="text-xs text-[#5a5a5f] mt-1 uppercase font-mono">
              ~{((impact.co2SavedKg || 0) * 4.2).toFixed(0)} KM OFFSET
            </p>
          </div>

          <div>
            <div className="spacex-caption">TOXIC HEAVY METALS</div>
            <div className="font-['D-DIN-Bold'] text-3xl sm:text-5xl font-bold text-[#ffffff] mt-2">
              {impact.toxicLeadSavedG || 0} <span className="text-sm font-normal text-[#5a5a5f]">G LEAD</span>
            </div>
            <p className="text-xs text-[#5a5a5f] mt-1 uppercase font-mono">SOIL DIVERSION</p>
          </div>
        </div>
      </section>

      {/* Lifecycle Status Pipeline Breakdown */}
      <section className="space-y-6">
        <div className="border-b border-[#3a3a3f] pb-4">
          <h2 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider">
            LIFECYCLE PIPELINE MANIFEST
          </h2>
          <span className="spacex-caption">REAL-TIME SERIALIZED STATE INGESTION</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { key: 'registered', label: 'Registered', count: statusCounts.registered || 0 },
            { key: 'scheduled', label: 'Scheduled', count: statusCounts.scheduled || 0 },
            { key: 'collected', label: 'Collected', count: statusCounts.collected || 0 },
            { key: 'handed_over', label: 'Handed Over', count: statusCounts.handed_over || 0 },
            { key: 'verified_recycled', label: 'Verified Recycled', count: statusCounts.verified_recycled || 0 },
          ].map((item) => (
            <div key={item.key} className="p-6 border border-[#3a3a3f] bg-[#000000] text-center">
              <span className="font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff] block">{item.count}</span>
              <span className="spacex-caption text-[11px] mt-2 block">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Participation by Hostel & E-Waste Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-[#3a3a3f] pt-12">
        {/* Participation by Hostel */}
        <section className="space-y-6">
          <div className="border-b border-[#3a3a3f] pb-4 flex items-center justify-between">
            <h3 className="font-['D-DIN-Bold'] text-xl text-[#ffffff] uppercase tracking-wider">
              STATION DIVERSION MASS
            </h3>
            <span className="spacex-caption">HOSTEL CLUSTERS</span>
          </div>

          <div className="space-y-4">
            {hostelStats.map((h) => {
              const percentage = totalKg > 0 ? Math.min(100, Math.round((h.totalKg / totalKg) * 100)) : 0;
              return (
                <div key={h.hostel} className="space-y-2 border-b border-[#3a3a3f] pb-3">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#ffffff] uppercase font-bold">STATION {h.hostel}</span>
                    <span className="text-[#5a5a5f]">
                      {h.totalKg} KG ({h.itemsCount} ASSETS) // {h.points} PTS
                    </span>
                  </div>
                  <div className="h-1 w-full bg-[#3a3a3f]">
                    <div
                      className="h-full bg-[#ffffff] transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* E-Waste Type Breakdown */}
        <section className="space-y-6">
          <div className="border-b border-[#3a3a3f] pb-4 flex items-center justify-between">
            <h3 className="font-['D-DIN-Bold'] text-xl text-[#ffffff] uppercase tracking-wider">
              HARDWARE CLASSIFICATION
            </h3>
            <span className="spacex-caption">{Object.keys(typeBreakdown).length} TYPES</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Object.entries(typeBreakdown).map(([typeName, count]) => (
              <div
                key={typeName}
                className="p-4 border border-[#3a3a3f] bg-[#000000] flex items-center justify-between"
              >
                <span className="font-['D-DIN-Bold'] text-xs text-[#ffffff] uppercase tracking-wider">
                  {typeName.split('/')[0]}
                </span>
                <span className="font-mono text-sm text-[#ffffff] font-bold">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Building,
  Truck,
  Recycle,
  ArrowRight,
  ArrowLeft,
  Scale,
  FileText,
  AlertOctagon,
} from 'lucide-react';

export default function CompliancePage({ onBack }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [auditRunning, setAuditRunning] = useState(false);
  const [complianceData, setComplianceData] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'items' | 'recyclers' | 'alerts'
  const [itemFilter, setItemFilter] = useState('all'); // 'all' | 'critical' | 'warning'
  const [resolvingId, setResolvingId] = useState(null);
  const [successBanner, setSuccessBanner] = useState('');

  const loadComplianceStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getComplianceStatus();
      if (res.success && res.data) {
        setComplianceData(res.data);
      }
    } catch (err) {
      console.error('Failed to load compliance data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplianceStatus();
  }, [loadComplianceStatus]);

  const handleRunAudit = async () => {
    try {
      setAuditRunning(true);
      setSuccessBanner('');
      const res = await api.runComplianceAudit();
      if (res.success && res.data) {
        setComplianceData(res.data);
        setSuccessBanner(
          res.data.totalCriticalBreaches > 0
            ? `CPCB COMPLIANCE AUDIT COMPLETED: ${res.data.totalCriticalBreaches} CRITICAL DEVIATIONS RECORDED.`
            : `CPCB COMPLIANCE AUDIT COMPLETED: 100% CONFORMANCE WITH STATUTORY 2022 RULES.`
        );
      }
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setAuditRunning(false);
    }
  };

  const handleResolveItem = async (itemId, trackingCode) => {
    try {
      setResolvingId(itemId);
      const res = await api.resolveOverdueItem(itemId);
      if (res.success) {
        setSuccessBanner(
          `CONSIGNMENT ${trackingCode} TRANSFERRED TO CPCB-AUTHORIZED RECYCLER. 30-DAY SLA RESTORED.`
        );
        await loadComplianceStatus();
      }
    } catch (err) {
      console.error('Failed to resolve overdue item:', err);
    } finally {
      setResolvingId(null);
    }
  };

  const itemAudit = complianceData?.itemAudit || {};
  const recyclerAudit = complianceData?.recyclerAudit || {};
  const healthScore = complianceData?.healthScore ?? 100;
  const totalBreaches = complianceData?.totalCriticalBreaches || 0;

  const allAuditedItems = [
    ...(itemAudit.criticalBreaches || []),
    ...(itemAudit.warningsDueSoon || []),
  ];

  const displayedItems = allAuditedItems.filter((item) => {
    if (itemFilter === 'critical') return item.severity === 'CRITICAL';
    if (itemFilter === 'warning') return item.severity === 'WARNING';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#000000] text-[#f0f0fa] pb-20 font-sans">
      {/* Top Header */}
      <header className="bg-[#000000] py-4 px-6 border-b border-[#3a3a3f] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (onBack) {
                onBack();
              } else if (typeof window !== 'undefined' && window.history.length > 1) {
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
          <div className="spacex-caption flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ffffff] inline-block" />
            <span>30-DAY SLA &amp; CPCB STATUTORY REGISTRY</span>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b border-[#3a3a3f] px-6 py-12 bg-[#000000]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-3xl">
            <div className="spacex-caption">// STATUTORY REGULATORY AUDIT ENGINE</div>
            <h1 className="font-['D-DIN-Bold'] text-4xl sm:text-6xl font-black text-[#ffffff] uppercase tracking-tight leading-[0.95]">
              COMPLIANCE SLA &amp; CPCB AUDIT
            </h1>
            <p className="text-base text-[#f0f0fa] leading-relaxed">
              Automated telemetry enforcement of Government of India E-Waste (Management) Rules 2022: Enforcing the strict 30-day recycler custody transfer window and continuous validity verification of recycler CPCB/SPCB permits.
            </p>
          </div>

          <div className="border border-[#3a3a3f] bg-[#0a0a0a] p-6 space-y-4 min-w-[280px]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="spacex-caption block">COMPLIANCE HEALTH</span>
                <div className="font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff] mt-1">
                  {healthScore} <span className="text-xs font-mono text-[#5a5a5f]">/ 100</span>
                </div>
              </div>
              <div className="border border-[#ffffff] px-3 py-1 font-['D-DIN-Bold'] text-xs text-[#ffffff] uppercase">
                {totalBreaches === 0 ? 'COMPLIANT' : `${totalBreaches} ACTION REQ`}
              </div>
            </div>

            <button
              onClick={handleRunAudit}
              disabled={auditRunning}
              className="btn-spacex w-full py-2.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${auditRunning ? 'animate-spin' : ''}`} />
              <span>{auditRunning ? 'RUNNING LIVE AUDIT...' : 'RUN INSTANT AUDIT'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 mt-12 space-y-12">
        {successBanner && (
          <div className="border border-[#ffffff] bg-[#0a0a0a] p-4 text-xs font-mono flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[#ffffff] font-bold">// NOTICE:</span>
              <span className="text-[#f0f0fa]">{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner('')}
              className="spacex-caption hover:text-[#ffffff]"
            >
              [DISMISS]
            </button>
          </div>
        )}

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border border-[#3a3a3f] bg-[#000000] p-6">
            <span className="spacex-caption block">30-DAY SLA BREACHES</span>
            <div className="font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff] mt-2">
              {itemAudit.totalCritical || 0}
            </div>
            <p className="text-xs font-mono text-[#5a5a5f] mt-1 uppercase">EXCEEDED 30-DAY THRESHOLD</p>
          </div>

          <div className="border border-[#3a3a3f] bg-[#000000] p-6">
            <span className="spacex-caption block">DISPATCH WARNINGS</span>
            <div className="font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff] mt-2">
              {itemAudit.totalWarnings || 0}
            </div>
            <p className="text-xs font-mono text-[#5a5a5f] mt-1 uppercase">23-29 DAYS IN DEPOT</p>
          </div>

          <div className="border border-[#3a3a3f] bg-[#000000] p-6">
            <span className="spacex-caption block">AUTHORISED RECYCLERS</span>
            <div className="font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff] mt-2">
              {recyclerAudit.totalActive || 0}
            </div>
            <p className="text-xs font-mono text-[#5a5a5f] mt-1 uppercase">CPCB ACCREDITED</p>
          </div>

          <div className="border border-[#3a3a3f] bg-[#000000] p-6">
            <span className="spacex-caption block">EXPIRED RECYCLER LICENSES</span>
            <div className="font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff] mt-2">
              {recyclerAudit.totalExpired || 0}
            </div>
            <p className="text-xs font-mono text-[#5a5a5f] mt-1 uppercase">ZERO TOLERANCE POLICY</p>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center gap-2 border-b border-[#3a3a3f] pb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-['D-DIN-Bold'] uppercase tracking-wider rounded-full border transition-all ${
              activeTab === 'all'
                ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff]'
            }`}
          >
            All Manifests
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 text-xs font-['D-DIN-Bold'] uppercase tracking-wider rounded-full border transition-all ${
              activeTab === 'items'
                ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff]'
            }`}
          >
            SLA Consignments ({allAuditedItems.length})
          </button>
          <button
            onClick={() => setActiveTab('recyclers')}
            className={`px-4 py-2 text-xs font-['D-DIN-Bold'] uppercase tracking-wider rounded-full border transition-all ${
              activeTab === 'recyclers'
                ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff]'
            }`}
          >
            Recycler Audit ({recyclerAudit.recyclers?.length || 0})
          </button>
        </div>

        {/* Table of Consignments */}
        {(activeTab === 'all' || activeTab === 'items') && (
          <section className="space-y-6">
            <div className="border-b border-[#3a3a3f] pb-4 flex items-center justify-between">
              <div>
                <h3 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider">
                  CONSIGNMENT SLA AUDIT LOG
                </h3>
                <span className="spacex-caption">STATUTORY 30-DAY TRANSFER WINDOW</span>
              </div>
            </div>

            {displayedItems.length === 0 ? (
              <div className="p-12 text-center border border-[#3a3a3f] bg-[#000000] spacex-caption">
                ALL ACTIVE CONSIGNMENTS CONFORM TO STATUTORY TRANSFER WINDOW.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>TAG CODE</th>
                      <th>CATEGORY</th>
                      <th>STATION</th>
                      <th>DAYS IN DEPOT</th>
                      <th>SLA STATUS</th>
                      <th className="text-right">COMMAND</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedItems.map((item) => (
                      <tr key={item.itemId}>
                        <td className="font-mono text-xs font-bold text-[#ffffff]">{item.trackingCode}</td>
                        <td className="text-xs uppercase text-[#f0f0fa]">{item.type}</td>
                        <td className="text-xs uppercase text-[#5a5a5f]">{item.userHostel}</td>
                        <td className="font-mono text-xs text-[#ffffff]">{item.daysInHolding} DAYS</td>
                        <td>
                          <span className={`px-2 py-0.5 text-[10px] font-mono border ${
                            item.severity === 'CRITICAL'
                              ? 'border-[#ffffff] bg-[#ffffff] text-[#000000] font-bold'
                              : 'border-[#3a3a3f] text-[#f0f0fa]'
                          }`}>
                            {item.severity} // {item.daysRemaining} DAYS REMAINING
                          </span>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => handleResolveItem(item.itemId, item.trackingCode)}
                            disabled={resolvingId === item.itemId}
                            className="btn-spacex py-1 px-3 text-[11px]"
                          >
                            <span>{resolvingId === item.itemId ? 'RESOLVING...' : 'DISPATCH TO RECYCLER'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Recyclers Audit */}
        {(activeTab === 'all' || activeTab === 'recyclers') && (
          <section className="space-y-6 border-t border-[#3a3a3f] pt-12">
            <div className="border-b border-[#3a3a3f] pb-4 flex items-center justify-between">
              <div>
                <h3 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider">
                  CPCB AUTHORISED RECYCLER PERMIT AUDIT
                </h3>
                <span className="spacex-caption">CENTRAL POLLUTION CONTROL BOARD ROSTER</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>FACILITY NAME</th>
                    <th>CPCB EPR REGISTRATION</th>
                    <th>EXPIRY DATE</th>
                    <th>DAYS REMAINING</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {(recyclerAudit.recyclers || []).map((r) => (
                    <tr key={r.id}>
                      <td className="font-['D-DIN-Bold'] text-sm uppercase text-[#ffffff]">{r.name}</td>
                      <td className="font-mono text-xs text-[#5a5a5f]">{r.cpcbRegistrationNo}</td>
                      <td className="font-mono text-xs text-[#f0f0fa]">{r.authExpiryDate}</td>
                      <td className="font-mono text-xs text-[#ffffff]">{r.daysRemaining} DAYS</td>
                      <td>
                        <span className={`px-2 py-0.5 text-[10px] font-mono border ${
                          r.isExpired
                            ? 'border-[#ffffff] bg-[#ffffff] text-[#000000] font-bold'
                            : 'border-[#3a3a3f] text-[#5a5a5f]'
                        }`}>
                          {r.isExpired ? 'EXPIRED' : 'VALIDATED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

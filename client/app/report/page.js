'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  FileText,
  Download,
  Printer,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';

export default function NaacReportPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api
      .getNaacReportSummary()
      .then((res) => {
        if (res.success) {
          setData(res);
        }
      })
      .catch((err) => console.warn('Could not load report data:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadPdf = () => {
    setDownloading(true);
    const pdfUrl = api.getNaacReportPdfUrl();
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', 'NAAC_Criteria_7_E-Waste_Accreditation_Report_2026.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => setDownloading(false), 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-6 text-[#5a5a5f] font-mono text-xs">
        <p className="spacex-caption">COMPUTING STATUTORY ACCREDITATION METRICS...</p>
      </div>
    );
  }

  const summary = data?.summary || {
    totalCollectedKg: 0,
    studentsParticipated: 0,
    verifiedRecyclingRate: 0,
    totalItemsCount: 0,
  };
  const cpcb = data?.cpcb || {
    recyclerName: 'Janavi Bairoliya',
    facilityName: 'CleanGreen Material Recovery & Dismantling LLP (Unit Netravati)',
    cpcbRegistrationNo: 'CPCB/EPR/RECYCLER/2023/KA-08492',
    spcbAuthNo: 'KSPCB/RO-UDU/E-WASTE/AUTH/2024-25/114',
    cpcbPortalUrl: 'https://eprewastecpcb.in',
    authorizedCapacity: '500 Metric Tonnes / Annum',
    complianceStandard: 'E-Waste (Management) Rules 2022 & CPCB EPR Guidelines',
  };
  const naac = data?.naac || {
    criteria: 'Criteria 7: Institutional Values and Best Practices',
    metric: '7.1.3: Management of Degradable and Non-Degradable Waste (E-Waste Management System)',
    institution: 'NMAM Institute of Technology (Nitte Deemed to be University)',
    academicYear: 'Academic Year 2025-2026',
  };
  const hostelBreakdown = data?.hostelBreakdown || [];
  const categoryBreakdown = data?.categoryBreakdown || [];

  return (
    <div className="min-h-screen bg-[#000000] text-[#f0f0fa] flex flex-col print:bg-white print:text-black">
      {/* Top Header */}
      <header className="bg-[#000000] py-4 px-6 border-b border-[#3a3a3f] sticky top-0 z-40 print:hidden">
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

          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="btn-spacex btn-spacex-muted py-1.5 px-3 text-xs">
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="btn-spacex py-1.5 px-4 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'GENERATING...' : 'DOWNLOAD NAAC PDF'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Document Content */}
      <main className="max-w-5xl mx-auto w-full px-6 py-12 flex-1 space-y-12">
        {/* Document Header */}
        <div className="border border-[#3a3a3f] bg-[#0a0a0a] p-8 space-y-3 text-center">
          <div className="spacex-caption text-[#ffffff]">
            // NAAC CRITERION 7 DISCLOSURE • METRIC 7.1.3
          </div>
          <h1 className="font-['D-DIN-Bold'] text-2xl sm:text-4xl font-black text-[#ffffff] uppercase tracking-tight">
            {naac.institution}
          </h1>
          <p className="text-xs font-mono text-[#5a5a5f]">
            Internal Quality Assurance Cell (IQAC) • Statutory Environmental Audit
          </p>
          <p className="text-xs font-mono text-[#ffffff] pt-1">
            OFFICIAL E-WASTE MANAGEMENT &amp; CLOSED-LOOP CIRCULARITY REPORT (AY 2025-26)
          </p>
        </div>

        {/* Executive Summary Metrics */}
        <section className="space-y-6">
          <div className="border-b border-[#3a3a3f] pb-4 flex items-center justify-between">
            <span className="spacex-caption">// 01 EXECUTIVE ACCREDITATION SUMMARY</span>
            <span className="spacex-caption font-mono">CODE: NITTE-IQAC-NAAC-CRIT7-2026</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="border border-[#3a3a3f] bg-[#000000] p-6">
              <span className="spacex-caption block">TOTAL MASS DIVERTED</span>
              <div className="font-['D-DIN-Bold'] text-3xl sm:text-4xl font-bold text-[#ffffff] mt-2">
                {summary.totalCollectedKg} <span className="text-xs font-mono text-[#5a5a5f]">KG</span>
              </div>
              <p className="text-xs font-mono text-[#5a5a5f] mt-1">SCALE-VERIFIED</p>
            </div>

            <div className="border border-[#3a3a3f] bg-[#000000] p-6">
              <span className="spacex-caption block">ENROLLED OPERATORS</span>
              <div className="font-['D-DIN-Bold'] text-3xl sm:text-4xl font-bold text-[#ffffff] mt-2">
                {summary.studentsParticipated}
              </div>
              <p className="text-xs font-mono text-[#5a5a5f] mt-1">CAMPUS ERP PARTICIPANTS</p>
            </div>

            <div className="border border-[#3a3a3f] bg-[#000000] p-6">
              <span className="spacex-caption block">CIRCULAR YIELD RATE</span>
              <div className="font-['D-DIN-Bold'] text-3xl sm:text-4xl font-bold text-[#ffffff] mt-2">
                {summary.verifiedRecyclingRate}%
              </div>
              <p className="text-xs font-mono text-[#5a5a5f] mt-1">ZERO LANDFILL YIELD</p>
            </div>

            <div className="border border-[#3a3a3f] bg-[#000000] p-6">
              <span className="spacex-caption block">CONSIGNMENT PASSPORTS</span>
              <div className="font-['D-DIN-Bold'] text-3xl sm:text-4xl font-bold text-[#ffffff] mt-2">
                {summary.totalItemsCount}
              </div>
              <p className="text-xs font-mono text-[#5a5a5f] mt-1">CRYPTOGRAPHIC TRACE</p>
            </div>
          </div>
        </section>

        {/* Statutory CPCB Partner Disclosure */}
        <section className="border border-[#3a3a3f] bg-[#000000] p-8 space-y-6">
          <div className="border-b border-[#3a3a3f] pb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="spacex-caption block">// 02 STATUTORY CPCB RECYCLER PARTNERSHIP</span>
              <h3 className="font-['D-DIN-Bold'] text-xl uppercase text-[#ffffff] mt-1">
                EXTENDED PRODUCER RESPONSIBILITY (EPR) ATTESTATION
              </h3>
            </div>
            <a
              href={cpcb.cpcbPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-spacex py-1.5 px-3 text-xs"
            >
              <span>CPCB EPR PORTAL</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            <div>
              <span className="spacex-caption block">AUTHORISED RECYCLER:</span>
              <p className="text-[#ffffff] font-bold mt-1 uppercase">{cpcb.recyclerName}</p>
            </div>
            <div>
              <span className="spacex-caption block">PROCESSING FACILITY:</span>
              <p className="text-[#ffffff] mt-1 uppercase">{cpcb.facilityName}</p>
            </div>
            <div>
              <span className="spacex-caption block">CPCB REGISTRATION:</span>
              <p className="text-[#ffffff] font-bold mt-1">{cpcb.cpcbRegistrationNo}</p>
            </div>
            <div>
              <span className="spacex-caption block">STATE PCB PERMIT:</span>
              <p className="text-[#ffffff] font-bold mt-1">{cpcb.spcbAuthNo}</p>
            </div>
          </div>
        </section>

        {/* Station Breakdown Table */}
        <section className="space-y-6">
          <div className="border-b border-[#3a3a3f] pb-4">
            <span className="spacex-caption block">// 03 STATION PARTICIPATION BREAKDOWN</span>
            <h3 className="font-['D-DIN-Bold'] text-2xl uppercase text-[#ffffff] mt-1">
              HOSTEL &amp; LAB DIVERSION LEDGER
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>STATION / HOSTEL</th>
                  <th className="text-right">DIVERTIED MASS</th>
                  <th className="text-right">CONSIGNMENTS</th>
                  <th className="text-right">ACTIVE OPERATORS</th>
                  <th className="text-right">CREDITS ALLOCATED</th>
                </tr>
              </thead>
              <tbody>
                {hostelBreakdown.map((h) => (
                  <tr key={h.hostel}>
                    <td className="font-['D-DIN-Bold'] text-sm uppercase text-[#ffffff]">STATION {h.hostel}</td>
                    <td className="font-mono text-right text-[#ffffff]">{h.totalKg} KG</td>
                    <td className="font-mono text-right text-[#5a5a5f]">{h.itemsCount}</td>
                    <td className="font-mono text-right text-[#5a5a5f]">{h.studentCount}</td>
                    <td className="font-mono text-right text-[#ffffff] font-bold">{h.totalPoints} PTS</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

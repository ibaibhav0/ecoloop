'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  Leaf,
  Download,
  Printer,
  ShieldCheck,
  ArrowLeft,
  Share2,
  ExternalLink,
} from 'lucide-react';

export default function CarbonCreditsPage() {
  const { user } = useAuth();
  const [campusData, setCampusData] = useState(null);
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [campusRes, certRes] = await Promise.all([
          api.getCampusCarbonMetrics(),
          api.getMyCarbonCertificate(selectedStudentId || undefined),
        ]);
        if (campusRes.success) setCampusData(campusRes);
        if (certRes.success) setCertData(certRes.certificate);
      } catch (err) {
        console.warn('Failed to load carbon metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    setIssueDate(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
  }, [user, selectedStudentId]);

  const [issueDate, setIssueDate] = useState('16 October 2026');

  const handleDownloadPdf = () => {
    setDownloading(true);
    const pdfUrl = api.getCarbonCertificatePdfUrl(selectedStudentId || undefined);
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute(
      'download',
      `EcoLoop_Carbon_Certificate_${(certData?.studentName || 'Student').replace(/\s+/g, '_')}.pdf`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => setDownloading(false), 1500);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const campus = campusData?.campusTotals || {
    totalDivertedKg: 0,
    verifiedRecycledKg: 0,
    totalCo2eSavedKg: 0,
    equivalentTreesPlanted: 0,
    equivalentCarKmAvoided: 0,
    equivalentSmartphoneCharges: 0,
    activeParticipatingStudents: 0,
  };

  const cert = certData || {
    certificateId: 'ECO-CARBON-PENDING',
    studentName: user?.name || '',
    studentEmail: user?.email || '',
    studentId: user?.studentId || '',
    hostel: user?.hostel || '',
    department: user?.department || '',
    totalEwasteRecycledKg: 0,
    co2eEmissionsSavedKg: 0,
    equivalentTreesPlanted: 0,
    equivalentCarKmAvoided: 0,
    equivalentSmartphoneCharges: 0,
    pointsEarned: user?.points || 0,
    issueDate: certData?.issueDate || issueDate,
    validity: 'Permanent Accreditation Record',
    signatories: [
      { name: 'Manan Sehgal', role: 'Campus Admin • EcoLoop Sustainability Chair' },
      { name: 'Janavi Bairoliya', role: 'Authorised Recycler • CPCB Reg. KA-08492' },
    ],
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#f0f0fa] flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-[#000000] border-b border-[#3a3a3f] py-4 px-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ffffff] inline-block" />
              <h1 className="font-['D-DIN-Bold'] text-sm uppercase tracking-wider text-[#ffffff]">
                CARBON CREDIT ACCREDITATION PROTOCOL
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleCopyLink} className="btn-spacex btn-spacex-muted py-1.5 px-3 text-xs">
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'COPIED' : 'SHARE'}</span>
            </button>
            <button onClick={() => window.print()} className="btn-spacex btn-spacex-muted py-1.5 px-3 text-xs">
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="btn-spacex py-1.5 px-4 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'GENERATING...' : 'DOWNLOAD PDF'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b border-[#3a3a3f] px-6 py-12 bg-[#000000]">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="spacex-caption">// GREENHOUSE GAS DIVERSION TELEMETRY</div>
          <h2 className="font-['D-DIN-Bold'] text-4xl sm:text-6xl font-black text-[#ffffff] uppercase tracking-tight leading-[0.95]">
            CARBON OFFSETS &amp; LIFECYCLE SAVINGS
          </h2>
          <p className="text-base text-[#f0f0fa] max-w-3xl leading-relaxed">
            Every kilogram of scale-verified e-waste diverted eliminates primary ore mining, fossil smelting, and synthetic resin manufacturing. Each digital passport is certified under Global E-waste Monitor (GEM) 2024 standards.
          </p>

          <div className="border border-[#3a3a3f] p-4 bg-[#0a0a0a] max-w-2xl mt-6 flex items-center justify-between gap-4 font-mono text-xs">
            <div>
              <span className="text-[#ffffff] font-bold block uppercase">EMPIRICAL BENCHMARK: 1 KG E-WASTE = 1.44 KG CO₂E AVOIDED</span>
              <span className="text-[#5a5a5f] mt-0.5 block">Global E-waste Monitor 2024 (UNITAR / ITU / UN Environment)</span>
            </div>
            <a
              href="https://ewastemonitor.info"
              target="_blank"
              rel="noreferrer"
              className="btn-spacex py-1.5 px-3 text-[11px] shrink-0"
            >
              <span>GEM 2024</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 flex-1 space-y-16">
        {/* Campus Totals */}
        <section className="space-y-6">
          <div className="border-b border-[#3a3a3f] pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider">
                CAMPUS CUMULATIVE OFFSETS
              </h3>
              <span className="spacex-caption">AGGREGATE DIVERSION TELEMETRY</span>
            </div>
            <span className="spacex-caption">REAL-TIME ATTESTATION</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="border border-[#3a3a3f] bg-[#000000] p-6">
              <span className="spacex-caption block">TOTAL CO₂E SAVED</span>
              <div className="font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff] mt-2">
                {campus.totalCo2eSavedKg} <span className="text-xs font-mono text-[#5a5a5f]">KG</span>
              </div>
              <p className="text-xs font-mono text-[#5a5a5f] mt-1">~{(campus.totalCo2eSavedKg / 1000).toFixed(2)} MT AVOIDED</p>
            </div>

            <div className="border border-[#3a3a3f] bg-[#000000] p-6">
              <span className="spacex-caption block">TREE SEQUESTRATION EQUIV.</span>
              <div className="font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff] mt-2">
                {campus.equivalentTreesPlanted} <span className="text-xs font-mono text-[#5a5a5f]">TREES</span>
              </div>
              <p className="text-xs font-mono text-[#5a5a5f] mt-1">ANNUAL URBAN SEQUESTRATION</p>
            </div>

            <div className="border border-[#3a3a3f] bg-[#000000] p-6">
              <span className="spacex-caption block">ROAD VEHICLE KM AVOIDED</span>
              <div className="font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff] mt-2">
                {campus.equivalentCarKmAvoided} <span className="text-xs font-mono text-[#5a5a5f]">KM</span>
              </div>
              <p className="text-xs font-mono text-[#5a5a5f] mt-1">PASSENGER TRANSPORT OFFSET</p>
            </div>

            <div className="border border-[#3a3a3f] bg-[#000000] p-6">
              <span className="spacex-caption block">TOTAL MASS DIVERTED</span>
              <div className="font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff] mt-2">
                {campus.totalDivertedKg} <span className="text-xs font-mono text-[#5a5a5f]">KG</span>
              </div>
              <p className="text-xs font-mono text-[#5a5a5f] mt-1">{campus.activeParticipatingStudents} OPERATORS</p>
            </div>
          </div>
        </section>

        {/* Individual Certificate Record */}
        <section className="space-y-6 border-t border-[#3a3a3f] pt-12">
          <div className="border-b border-[#3a3a3f] pb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider">
                PERSONAL CARBON CREDIT CERTIFICATE
              </h3>
              <span className="spacex-caption">PERMANENT CRYPTOGRAPHIC ACCREDITATION</span>
            </div>
            <button onClick={handleDownloadPdf} className="btn-spacex">
              <Download className="w-3.5 h-3.5" />
              <span>Export Official PDF</span>
            </button>
          </div>

          {/* Certificate Board */}
          <div className="border border-[#ffffff] bg-[#0a0a0a] p-8 md:p-12 space-y-8 font-mono">
            <div className="flex flex-wrap items-start justify-between border-b border-[#3a3a3f] pb-6 gap-4">
              <div>
                <span className="spacex-caption">SERIALIZED CERTIFICATE ID:</span>
                <div className="font-['D-DIN-Bold'] text-xl text-[#ffffff] tracking-widest mt-1">
                  {cert.certificateId}
                </div>
              </div>
              <div className="text-right">
                <span className="spacex-caption">ISSUANCE DATE:</span>
                <div className="text-xs text-[#ffffff] mt-1">{cert.issueDate}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              <div className="space-y-3">
                <div>
                  <span className="spacex-caption block">ACCREDITED OPERATOR:</span>
                  <span className="font-['D-DIN-Bold'] text-xl uppercase text-[#ffffff] mt-1 block">
                    {cert.studentName || user?.name || 'STUDENT OPERATOR'}
                  </span>
                </div>
                <div>
                  <span className="spacex-caption block">STATION / CLUSTER:</span>
                  <span className="text-[#f0f0fa]">{cert.hostel || user?.hostel || 'CAMPUS RESIDENCE'}</span>
                </div>
                <div>
                  <span className="spacex-caption block">EMAIL IDENTIFIER:</span>
                  <span className="text-[#5a5a5f]">{cert.studentEmail || user?.email}</span>
                </div>
              </div>

              <div className="space-y-3 md:border-l md:border-[#3a3a3f] md:pl-8">
                <div>
                  <span className="spacex-caption block">NET VERIFIED E-WASTE MASS:</span>
                  <span className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] mt-1 block">
                    {cert.totalEwasteRecycledKg || 0} KG
                  </span>
                </div>
                <div>
                  <span className="spacex-caption block">CALCULATED CARBON REDUCTION:</span>
                  <span className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] mt-1 block">
                    {cert.co2eEmissionsSavedKg || 0} KG CO₂E
                  </span>
                </div>
                <div>
                  <span className="spacex-caption block">RECOVERY REWARD CREDITS:</span>
                  <span className="text-[#ffffff] font-bold">{cert.pointsEarned || 0} PTS</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#3a3a3f] pt-6 flex flex-wrap items-center justify-between text-[11px] text-[#5a5a5f] gap-4">
              <div>
                <span>STATUS: </span>
                <span className="text-[#ffffff] uppercase font-bold">{cert.validity}</span>
              </div>
              <div>
                <span>AUTHORIZED SIGNATORY: </span>
                <span className="text-[#ffffff]">MANAN SEHGAL (ECOLOOP CHAIR) • JANAVI BAIROLIYA (CPCB RECYCLER)</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

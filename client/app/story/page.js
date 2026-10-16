'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';

const DEMO_STUDENTS = [
  { id: '4NM22CS045', name: 'Baibhav Kumar', email: 'baibhav@ecoloop.campus', hostel: 'Nandani', note: '3 kg recycled • 4.32 kg CO2 • 0.2 trees' },
  { id: '4NM22IS023', name: 'Ananya Iyer', email: 'ananya@ecoloop.campus', hostel: 'Kaveri', note: '11.1 kg recycled • 15.98 kg CO2 • 0.7 trees' },
  { id: '4NM22ME112', name: 'Rohit Shetty', email: 'rohit@ecoloop.campus', hostel: 'Kumardhara', note: '6.2 kg recycled • 8.93 kg CO2 • 0.4 trees' },
];

export default function PersonalImpactStoryPage() {
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState(user?.studentId || '4NM22CS045');
  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sharedToast, setSharedToast] = useState('');

  const loadStory = useCallback(async (studentId) => {
    try {
      setLoading(true);
      const res = await api.getPersonalImpactStory(studentId);
      if (res.success) {
        setStoryData(res);
      }
    } catch (err) {
      console.error('Failed to load impact story:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStory(selectedStudent);
  }, [selectedStudent, loadStory]);

  const handleCopyStory = () => {
    if (!storyData) return;
    const { story, student } = storyData;
    const textToCopy = `${student.name}'s EcoLoop Circular Impact Story:\n\n"${story.primaryQuote}"\n\n• E-Waste Recycled: ${story.displayWeight} kg\n• CO2e Avoided: ${story.displayCo2} kg (Global E-waste Monitor 2024)\n• Trees Equivalent: ${story.displayTrees} urban trees (US EPA)\n• Car Travel Avoided: ${story.carKmAvoided} km\n\nVerified circular chain of custody on campus.\nhttps://ecoloop.campus`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setSharedToast('STORY COPIED TO CLIPBOARD.');
    setTimeout(() => {
      setCopied(false);
      setSharedToast('');
    }, 3000);
  };

  const handleShareClick = (platformName) => {
    setSharedToast(`OPENING ${platformName.toUpperCase()} PROTOCOL...`);
    setTimeout(() => setSharedToast(''), 3000);
  };

  const student = storyData?.student || {
    name: user?.name || 'Student',
    studentId: user?.studentId || '4NM22CS045',
    department: user?.department || 'Computer Science & Engineering',
    hostel: user?.hostel || 'Nandani',
    points: user?.points || 0,
  };

  const story = storyData?.story || {
    primaryQuote: "Register your first item to begin verified CO2 avoidance telemetry.",
    displayWeight: '0',
    displayCo2: '0',
    displayTrees: '0',
    carKmAvoided: '0',
    smartphoneCharges: 0,
    descriptiveStory: "No e-waste consignments have been registered yet.",
    itemBreakdown: [],
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#f0f0fa] pb-24 font-sans">
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
          <div className="spacex-caption flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ffffff] inline-block" />
            <span>VERIFIED PERSONAL IMPACT DISCLOSURE</span>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b border-[#3a3a3f] px-6 py-12 bg-[#000000]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="spacex-caption">// CERTIFIED INDIVIDUAL ACCOUNTING</div>
            <h1 className="font-['D-DIN-Bold'] text-4xl sm:text-6xl font-black text-[#ffffff] uppercase tracking-tight leading-[0.95]">
              CIRCULAR IMPACT STORY
            </h1>
            <p className="text-base text-[#f0f0fa] leading-relaxed">
              Derived strictly from calibrated hardware weigh-ins and peer-reviewed Global E-waste Monitor (GEM 2024) greenhouse gas models.
            </p>
          </div>

          {/* Student Selector */}
          <div className="border border-[#3a3a3f] bg-[#0a0a0a] p-4 space-y-2 shrink-0 font-mono text-xs">
            <div className="spacex-caption">SELECT OPERATOR DOSSIER:</div>
            <div className="flex flex-wrap gap-2">
              {DEMO_STUDENTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudent(s.id)}
                  className={`px-3 py-1.5 uppercase border transition-all ${
                    selectedStudent === s.id
                      ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                      : 'border-[#3a3a3f] text-[#5a5a5f] hover:text-[#ffffff]'
                  }`}
                >
                  {s.name.split(' ')[0]} ({s.hostel})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Story Container */}
      <main className="max-w-7xl mx-auto px-6 mt-12 space-y-12">
        {sharedToast && (
          <div className="p-4 border border-[#ffffff] bg-[#0a0a0a] text-xs font-mono flex items-center justify-between gap-4">
            <span className="text-[#ffffff] font-bold">// {sharedToast}</span>
            <button onClick={() => setSharedToast('')} className="spacex-caption hover:text-[#ffffff]">
              [DISMISS]
            </button>
          </div>
        )}

        {/* HERO STORY BOARD */}
        <div className="border border-[#ffffff] bg-[#0a0a0a] p-8 md:p-12 space-y-8">
          {/* Operator Profile */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#3a3a3f] pb-6 font-mono text-xs">
            <div>
              <span className="spacex-caption block">ACCREDITED OPERATOR:</span>
              <h2 className="font-['D-DIN-Bold'] text-3xl font-black text-[#ffffff] uppercase mt-1">
                {student.name}
              </h2>
              <p className="text-[#5a5a5f] mt-1">
                STATION: {student.hostel} // USN: {student.studentId}
              </p>
            </div>

            <div className="border border-[#3a3a3f] px-4 py-2 bg-[#000000]">
              <span className="spacex-caption block">RECOVERY CREDITS:</span>
              <span className="font-['D-DIN-Bold'] text-2xl font-bold text-[#ffffff]">
                +{student.points || 0} PTS
              </span>
            </div>
          </div>

          {/* Primary Quote */}
          <div className="space-y-4">
            <div className="spacex-caption">// ATTESTED CIRCULAR LIFECYCLE QUOTE</div>
            <blockquote className="font-['D-DIN-Bold'] text-2xl sm:text-4xl text-[#ffffff] uppercase leading-tight">
              &ldquo;{story.primaryQuote}&rdquo;
            </blockquote>
            <p className="text-sm font-mono text-[#f0f0fa] leading-relaxed max-w-4xl">
              {story.descriptiveStory}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-[#3a3a3f] pt-8">
            <div className="border border-[#3a3a3f] p-6 bg-[#000000]">
              <span className="spacex-caption block">HARDWARE DIVERTED</span>
              <div className="font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff] mt-2">
                {story.displayWeight} <span className="text-xs font-mono text-[#5a5a5f]">KG</span>
              </div>
            </div>

            <div className="border border-[#3a3a3f] p-6 bg-[#000000]">
              <span className="spacex-caption block">CO₂E AVOIDED</span>
              <div className="font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff] mt-2">
                {story.displayCo2} <span className="text-xs font-mono text-[#5a5a5f]">KG</span>
              </div>
            </div>

            <div className="border border-[#3a3a3f] p-6 bg-[#000000]">
              <span className="spacex-caption block">TREE EQUIVALENT</span>
              <div className="font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff] mt-2">
                {story.displayTrees} <span className="text-xs font-mono text-[#5a5a5f]">TREES</span>
              </div>
            </div>

            <div className="border border-[#3a3a3f] p-6 bg-[#000000]">
              <span className="spacex-caption block">ROAD KM AVOIDED</span>
              <div className="font-['D-DIN-Bold'] text-4xl font-bold text-[#ffffff] mt-2">
                {story.carKmAvoided} <span className="text-xs font-mono text-[#5a5a5f]">KM</span>
              </div>
            </div>
          </div>

          {/* Social Share Controls */}
          <div className="border-t border-[#3a3a3f] pt-6 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <span className="spacex-caption">// SHARE THIS VERIFIED ATTESTATION:</span>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleCopyStory} className="btn-spacex py-2 px-4 text-xs">
                <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY DOSSIER'}</span>
              </button>
              <button onClick={() => handleShareClick('X / Twitter')} className="btn-spacex btn-spacex-muted py-2 px-4 text-xs">
                <span>X / TWITTER</span>
              </button>
              <button onClick={() => handleShareClick('LinkedIn')} className="btn-spacex btn-spacex-muted py-2 px-4 text-xs">
                <span>LINKEDIN</span>
              </button>
              <button onClick={() => handleShareClick('WhatsApp')} className="btn-spacex btn-spacex-muted py-2 px-4 text-xs">
                <span>WHATSAPP</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

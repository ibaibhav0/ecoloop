'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronRight, Cpu, Server, Layers } from 'lucide-react';

const SLIDES = [
  {
    id: 'silicon',
    caption: 'CAMPUS RECOVERY PROTOCOL // CPCB 2022',
    line1: 'DECOMMISSIONING',
    line2: 'CAMPUS E-WASTE AT SCALE',
    description:
      'EcoLoop is the verified circular platform capable of recovering 100% of institutional hardware and personal electronics across campus laboratories and hostels.',
    image: '/images/hero-circuit.jpg',
    primaryActionText: 'REGISTER HARDWARE',
    secondaryActionText: 'VIEW 50+ PRODUCTS',
    targetTab: 'catalog',
  },
  {
    id: 'servers',
    caption: 'INSTITUTIONAL INFRASTRUCTURE // NAAC 7.1.3',
    line1: 'INSTITUTIONAL',
    line2: 'SERVER & LAB DECOMMISSIONING',
    description:
      'High-throughput recovery pipelines for computational clusters, networking racks, and precision lab instrumentation with statutory Form-6 manifests.',
    image: '/images/lab-servers.jpg',
    primaryActionText: 'OPERATIONS HUB',
    secondaryActionText: 'COMPLIANCE SLA',
    targetTab: 'requests',
  },
  {
    id: 'materials',
    caption: 'MATERIAL VALUE LEDGER // ZERO LANDFILL',
    line1: 'CIRCULAR HARVEST',
    line2: 'RARE EARTHS & SILICON',
    description:
      'Extracting gold, copper, tantalum, and lithium to eliminate hazardous campus toxic runoffs and mint verified carbon offset certificates.',
    image: '/images/dismantled-hardware.jpg',
    primaryActionText: 'CARBON LEDGER',
    secondaryActionText: 'CAMPUS MAP',
    targetTab: 'carbon',
  },
];

export default function SpacexHeroShowcase({
  onOpenRegister,
  onNavigateTab,
}) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Auto-advance every 9 seconds, but user can click to switch
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlideIndex];

  return (
    <section className="relative w-full min-h-[580px] md:min-h-[640px] lg:min-h-[700px] flex items-center justify-between overflow-hidden border-b border-[#27272a] bg-black">
      {/* Background Image of Electronic Items Behind Text */}
      <div
        key={slide.id}
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 transform scale-100 animate-in fade-in zoom-in-95 duration-700"
        style={{ backgroundImage: `url('${slide.image}')` }}
      />

      {/* SpaceX Dark Gradient Overlays for Razor-Sharp Text Contrast */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/95 via-black/75 to-black/30" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-transparent to-black/70" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_50%,rgba(0,0,0,0.85)_0%,transparent_75%)]" />

      {/* SpaceX Content Layout */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 py-16 flex flex-col justify-center min-h-[580px] md:min-h-[640px]">
        <div className="max-w-2xl space-y-6">
          
          {/* Micro Category */}
          <div className="spacex-caption text-[#888891] tracking-[2px] text-xs">
            {slide.caption}
          </div>

          {/* Massive SpaceX Uppercase Headline */}
          <h1 className="font-['Barlow_Condensed'] text-5xl sm:text-6xl md:text-7xl font-extrabold text-[#ffffff] tracking-tight uppercase leading-[0.92]">
            {slide.line1}
            <br />
            <span className="text-white/95">{slide.line2}</span>
          </h1>

          {/* Concise Paragraph */}
          <p className="text-[#e4e4e7] text-base sm:text-lg leading-relaxed max-w-xl font-normal">
            {slide.description}
          </p>

          {/* Action Buttons: SpaceX Ghost Rectangular Button Style (STARMIND ->) */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                if (slide.targetTab && onNavigateTab) {
                  onNavigateTab(slide.targetTab);
                } else if (onOpenRegister) {
                  onOpenRegister();
                }
              }}
              className="btn-spacex-hero group"
            >
              <span>{slide.primaryActionText}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            {onOpenRegister && (
              <button
                onClick={onOpenRegister}
                className="btn-spacex py-3 px-6 text-xs"
              >
                <span>+ REGISTER ITEM</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SpaceX Bottom Center Capsule Pill Indicator (matching Image 1) */}
      <div className="absolute bottom-6 left-0 right-0 z-10 flex items-center justify-center gap-3">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentSlideIndex(idx)}
            className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer border-0 p-0 ${
              idx === currentSlideIndex
                ? 'w-10 bg-white'
                : 'w-4 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Slide Thumbnails / Labels (Right side on desktop) */}
      <div className="hidden xl:flex absolute right-8 bottom-8 z-10 flex-col gap-2">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentSlideIndex(idx)}
            className={`text-right text-xs font-['Barlow_Condensed'] uppercase tracking-[1.5px] transition-all cursor-pointer border-0 bg-transparent py-1 ${
              idx === currentSlideIndex
                ? 'text-white font-bold border-r-2 border-white pr-2'
                : 'text-zinc-500 hover:text-white pr-2'
            }`}
          >
            0{idx + 1} // {s.line1}
          </button>
        ))}
      </div>
    </section>
  );
}

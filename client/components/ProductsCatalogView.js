'use client';

import React, { useState, useMemo } from 'react';
import {
  PRODUCTS_CATALOG,
  CUSTOMER_SEGMENTS,
  PRODUCT_CATEGORIES,
} from '@/lib/productsCatalog';
import {
  Search,
  Plus,
} from 'lucide-react';

export default function ProductsCatalogView({ onQuickRegisterItem }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = useMemo(() => {
    return PRODUCTS_CATALOG.filter((item) => {
      if (selectedSegment !== 'all') {
        if (selectedSegment === 'student' && item.customerType !== 'student' && item.customerType !== 'both') {
          return false;
        }
        if (selectedSegment === 'college' && item.customerType !== 'college' && item.customerType !== 'both') {
          return false;
        }
        if (selectedSegment === 'both' && item.customerType !== 'both') {
          return false;
        }
      }

      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        const matchesCpcb = item.cpcbCategory.toLowerCase().includes(query);
        const matchesTarget = item.targetUserLabel.toLowerCase().includes(query);
        const matchesMaterials = item.recoverableMaterials.some((m) => m.toLowerCase().includes(query));
        const matchesHazards = item.toxicHazards.some((h) => h.toLowerCase().includes(query));
        return matchesName || matchesCat || matchesCpcb || matchesTarget || matchesMaterials || matchesHazards;
      }

      return true;
    });
  }, [searchTerm, selectedSegment, selectedCategory]);

  return (
    <div className="space-y-12">
      {/* Catalog Mission Header */}
      <div className="border-b border-[#3a3a3f] pb-8">
        <div className="spacex-caption mb-3">// HARDWARE INVENTORY: {PRODUCTS_CATALOG.length} UNITS</div>
        <h1 className="font-['D-DIN-Bold'] text-3xl sm:text-5xl font-black text-[#ffffff] uppercase tracking-tight">
          MASTER RECOVERY CATALOG
        </h1>
        <p className="text-[#f0f0fa] text-base mt-2 max-w-2xl leading-relaxed">
          Classified specification ledger covering personal student hardware and high-throughput departmental laboratory clusters under CPCB Rules 2022.
        </p>

        {/* Telemetry Breakdown */}
        <div className="flex flex-wrap gap-8 pt-6 border-t border-[#3a3a3f] mt-8 text-xs spacex-caption">
          <div>
            <span className="text-[#ffffff] font-bold text-sm block">24 UNITS</span>
            <span>STUDENT PERSONAL</span>
          </div>
          <div className="border-l border-[#3a3a3f] pl-8">
            <span className="text-[#ffffff] font-bold text-sm block">31 UNITS</span>
            <span>INSTITUTIONAL LABS</span>
          </div>
          <div className="border-l border-[#3a3a3f] pl-8">
            <span className="text-[#ffffff] font-bold text-sm block">100%</span>
            <span>STATUTORY COMPLIANCE</span>
          </div>
        </div>
      </div>

      {/* Filter and Query Strip */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SEARCH CATALOG BY CODE, MATERIAL, OR HARDWARE SPECIFICATION..."
              className="w-full px-4 py-3"
            />
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="w-full px-4 py-3"
            >
              <option value="all">ALL SECTORS</option>
              <option value="student">STUDENT SECTOR</option>
              <option value="college">COLLEGE / LAB SECTOR</option>
              <option value="both">SHARED INFRASTRUCTURE</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#3a3a3f] pb-3">
          <button
            key="all"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 text-xs font-['D-DIN-Bold'] uppercase tracking-[1.17px] whitespace-nowrap transition-all rounded-full border cursor-pointer ${
              selectedCategory === 'all'
                ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff] hover:border-[#3a3a3f]'
            }`}
          >
            ALL HARDWARE
          </button>
          {PRODUCT_CATEGORIES.map((catName) => {
            const isSelected = selectedCategory === catName;
            return (
              <button
                key={catName}
                onClick={() => setSelectedCategory(catName)}
                className={`px-4 py-1.5 text-xs font-['D-DIN-Bold'] uppercase tracking-[1.17px] whitespace-nowrap transition-all rounded-full border cursor-pointer ${
                  isSelected
                    ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                    : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff] hover:border-[#3a3a3f]'
                }`}
              >
                {catName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((item) => (
          <div
            key={item.id}
            className="border border-[#3a3a3f] bg-[#0a0a0a] p-6 flex flex-col justify-between"
          >
            <div>
              {/* Item Metadata */}
              <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-3 mb-4">
                <span className="font-mono text-xs text-[#ffffff] uppercase tracking-wider font-bold">
                  {item.cpcbCategory}
                </span>
                <span className="spacex-caption">
                  [{item.customerType.toUpperCase()}]
                </span>
              </div>

              <h3 className="font-['D-DIN-Bold'] text-xl text-[#ffffff] uppercase tracking-wider mb-2">
                {item.name}
              </h3>
              <p className="text-[#5a5a5f] text-xs leading-relaxed mb-6">
                {item.description}
              </p>

              {/* Specs */}
              <div className="border-t border-[#3a3a3f] pt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="spacex-caption">CALIBRATED MASS:</span>
                  <span className="font-mono text-[#ffffff]">{item.avgWeightKg} KG</span>
                </div>
                <div className="flex justify-between">
                  <span className="spacex-caption">STATION USE:</span>
                  <span className="text-[#f0f0fa] truncate max-w-[180px]">{item.targetUserLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="spacex-caption">MATERIALS:</span>
                  <span className="text-[#f0f0fa] truncate max-w-[180px]">{item.recoverableMaterials.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#3a3a3f]">
              <button
                type="button"
                onClick={() => onQuickRegisterItem && onQuickRegisterItem(item)}
                className="btn-spacex w-full"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Initialize Item</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

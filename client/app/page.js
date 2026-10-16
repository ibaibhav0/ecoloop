'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import LoginGate from '@/components/LoginGate';
import ProductsCatalogView from '@/components/ProductsCatalogView';

// Core Dashboard & Table Components
import StudentDashboard from '@/components/StudentDashboard';
import RequestsTable from '@/components/RequestsTable';
import LeaderboardView from '@/components/LeaderboardView';
import AnalyticsView from '@/components/AnalyticsView';

// Sub-Portal Single-Page Views
import CampusMapPage from '@/app/map/page';
import CarbonCreditsPage from '@/app/carbon/page';
import PersonalImpactStoryPage from '@/app/story/page';
import NaacReportPage from '@/app/report/page';
import CompliancePage from '@/app/compliance/page';
import PartnershipPortalPage from '@/app/partners/page';
import DevelopersPortalPage from '@/app/developers/page';
import AdminDashboardPage from '@/app/admin/page';
import RecyclerPage from '@/app/recycler/page';
import ScanQrPage from '@/app/scan/page';

// Modals
import RegisterItemModal from '@/components/RegisterItemModal';
import SchedulePickupModal from '@/components/SchedulePickupModal';
import QrDisplayModal from '@/components/QrDisplayModal';
import StatusTrackerModal from '@/components/StatusTrackerModal';
import QrScannerModal from '@/components/QrScannerModal';
import CollectWeightModal from '@/components/CollectWeightModal';
import HandoverRecyclerModal from '@/components/HandoverRecyclerModal';
import VerifyRecycledModal from '@/components/VerifyRecycledModal';

import {
  Recycle,
  Sparkles,
  ShieldCheck,
  Building2,
  GraduationCap,
  ArrowLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

const TAB_LABELS = {
  dashboard: 'Dashboard',
  catalog: '50+ Products Catalog',
  requests: 'Campus Operations Hub',
  map: 'Campus Collection Map',
  carbon: 'Carbon Credits & Offsets',
  story: 'Personal Impact Story',
  report: 'NAAC Criterion 7 Report',
  compliance: 'Compliance SLA & CPCB Audit',
  partners: 'Municipality & NGO Network',
  developers: 'REST API & Documentation',
  leaderboard: 'Hostel Leaderboard',
  analytics: 'Campus Analytics',
};

export default function Home() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tabHistory, setTabHistory] = useState(['dashboard']);

  const handleTabChange = (newTab) => {
    if (newTab !== activeTab) {
      setTabHistory((prev) => [...prev, newTab]);
      setActiveTab(newTab);
    }
  };

  const handleGoBack = () => {
    if (tabHistory.length > 1) {
      const updated = [...tabHistory];
      updated.pop(); // remove current tab
      const prev = updated[updated.length - 1];
      setTabHistory(updated);
      setActiveTab(prev || 'dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCatalogInGate, setShowCatalogInGate] = useState(false);

  // Modal States
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCollectOpen, setIsCollectOpen] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [isRecycleOpen, setIsRecycleOpen] = useState(false);

  // Active Selected Item for Modals
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Fetch Items
  const loadItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getItems();
      if (res.success && res.items) {
        setItems(res.items);
      }
    } catch (e) {
      console.warn('Error fetching items:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadItems();
  }, [loadItems, user?.role, user?.id]);

  // Handle Register Success
  const handleRegisterSuccess = (newItem) => {
    loadItems();
    setSelectedCatalogItem(null);
    setSelectedItem(newItem);
    setIsQrOpen(true);
  };

  // Handle Scanner Success
  const handleScanSuccess = (scannedItem) => {
    setSelectedItem(scannedItem);
    if (['registered', 'scheduled'].includes(scannedItem.status)) {
      setIsCollectOpen(true);
    } else if (scannedItem.status === 'collected') {
      setIsHandoverOpen(true);
    } else if (scannedItem.status === 'handed_over') {
      setIsRecycleOpen(true);
    } else {
      setSelectedItemId(scannedItem._id || scannedItem.id);
      setIsTrackerOpen(true);
    }
  };

  const handleActionSuccess = () => {
    loadItems();
    refreshUser();
  };

  // 1. Initial Auth Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center text-[#ffffff] p-6 text-center">
        <span className="font-['D-DIN-Bold'] text-3xl tracking-[4px] uppercase mb-4 text-[#ffffff]">
          ECOLOOP
        </span>
        <div className="w-12 h-px bg-[#ffffff] mb-4 animate-pulse" />
        <span className="spacex-caption">INITIALIZING CAMPUS TELEMETRY...</span>
      </div>
    );
  }

  // 2. Mandatory Login Gate (If unauthenticated)
  if (!user) {
    if (showCatalogInGate) {
      return (
        <div className="min-h-screen bg-[#000000] text-[#f0f0fa] p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-4">
              <button
                onClick={() => setShowCatalogInGate(false)}
                className="btn-spacex"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
              <div className="spacex-caption">
                ECOLOOP CATALOG // 55+ ITEMS
              </div>
            </div>

            <ProductsCatalogView
              onQuickRegisterItem={() => setShowCatalogInGate(false)}
            />
          </div>
        </div>
      );
    }

    return <LoginGate onExploreCatalog={() => setShowCatalogInGate(true)} />;
  }

  // 3. Authenticated Single-Page Experience
  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-[#f0f0fa]">
      {/* Top Single-Page Navbar with Non-Overflowing Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenRegister={() => {
          setSelectedCatalogItem(null);
          setIsRegisterOpen(true);
        }}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* College Institutional Banner if logged in as College Role */}
      {user?.role === 'college' && (
        <div className="bg-[#0a0a0a] border-b border-[#3a3a3f] px-6 py-3 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="spacex-caption">// INSTITUTIONAL LAB CLUSTER:</span>
              <span className="text-[#f0f0fa] font-mono text-xs">
                {user.name} ({user.department || 'Computer Science & Engineering'}) • Station Yourspace
              </span>
            </div>
            <button
              onClick={() => handleTabChange('catalog')}
              className="btn-spacex py-1 px-3 text-[11px]"
            >
              Catalog &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Main Single-Page Dynamic View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Universal Back to Last Page Bar */}
        {activeTab !== 'dashboard' && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#3a3a3f] pb-4">
            <button
              onClick={handleGoBack}
              className="btn-spacex"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="spacex-caption">VIEW:</span>
              <span className="font-['D-DIN-Bold'] uppercase text-xs tracking-[1.17px] text-[#ffffff]">
                {TAB_LABELS[activeTab] || activeTab}
              </span>
            </div>
          </div>
        )}
        {/* VIEW 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <>
            {user?.role === 'student' || user?.role === 'college' ? (
              <StudentDashboard
                items={items}
                loading={loading}
                onOpenRegister={() => {
                  setSelectedCatalogItem(null);
                  setIsRegisterOpen(true);
                }}
                onOpenSchedule={(item) => {
                  setSelectedItem(item);
                  setIsScheduleOpen(true);
                }}
                onOpenTracker={(id) => {
                  setSelectedItemId(id);
                  setIsTrackerOpen(true);
                }}
                onOpenQr={(item) => {
                  setSelectedItem(item);
                  setIsQrOpen(true);
                }}
                onOpenLeaderboard={() => handleTabChange('leaderboard')}
              />
            ) : user?.role === 'admin' ? (
              <AdminDashboardPage />
            ) : user?.role === 'recycler' ? (
              <RecyclerPage />
            ) : (
              <RequestsTable
                items={items}
                loading={loading}
                onOpenScanner={() => setIsScannerOpen(true)}
                onOpenCollect={(item) => {
                  setSelectedItem(item);
                  setIsCollectOpen(true);
                }}
                onOpenHandover={(item) => {
                  setSelectedItem(item);
                  setIsHandoverOpen(true);
                }}
                onOpenRecycle={(item) => {
                  setSelectedItem(item);
                  setIsRecycleOpen(true);
                }}
                onOpenTracker={(id) => {
                  setSelectedItemId(id);
                  setIsTrackerOpen(true);
                }}
                onOpenQr={(item) => {
                  setSelectedItem(item);
                  setIsQrOpen(true);
                }}
              />
            )}
          </>
        )}

        {/* VIEW 2: 50+ Products Catalog (Students & Colleges) */}
        {activeTab === 'catalog' && (
          <ProductsCatalogView
            onQuickRegisterItem={(item) => {
              setSelectedCatalogItem(item);
              setIsRegisterOpen(true);
            }}
          />
        )}

        {/* VIEW 3: Operations Requests Table */}
        {activeTab === 'requests' && (
          <RequestsTable
            items={items}
            loading={loading}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenCollect={(item) => {
              setSelectedItem(item);
              setIsCollectOpen(true);
            }}
            onOpenHandover={(item) => {
              setSelectedItem(item);
              setIsHandoverOpen(true);
            }}
            onOpenRecycle={(item) => {
              setSelectedItem(item);
              setIsRecycleOpen(true);
            }}
            onOpenTracker={(id) => {
              setSelectedItemId(id);
              setIsTrackerOpen(true);
            }}
            onOpenQr={(item) => {
              setSelectedItem(item);
              setIsQrOpen(true);
            }}
          />
        )}

        {/* VIEW 4: Campus Map View */}
        {activeTab === 'map' && <CampusMapPage />}

        {/* VIEW 5: Carbon Credits & Personal Certificates */}
        {activeTab === 'carbon' && <CarbonCreditsPage />}

        {/* VIEW 6: Personal Impact Story & Social Share */}
        {activeTab === 'story' && <PersonalImpactStoryPage />}

        {/* VIEW 7: NAAC Criterion 7 E-Waste Report */}
        {activeTab === 'report' && <NaacReportPage />}

        {/* VIEW 8: 30-Day SLA & Recycler Expiry Compliance */}
        {activeTab === 'compliance' && <CompliancePage />}

        {/* VIEW 9: Municipality & NGO Partnership Portal */}
        {activeTab === 'partners' && <PartnershipPortalPage />}

        {/* VIEW 10: Public REST API & Swagger Documentation */}
        {activeTab === 'developers' && <DevelopersPortalPage />}

        {/* VIEW 11: Hostel & Department Leaderboard */}
        {activeTab === 'leaderboard' && <LeaderboardView />}

        {/* VIEW 12: Impact Analytics */}
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Unified Single-Page Footer: Austere SpaceX Aerospace Bar */}
      <footer className="border-t border-[#3a3a3f] bg-[#000000] py-8 mt-auto px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-['D-DIN-Bold'] uppercase tracking-[2px] text-sm text-[#ffffff]">
              ECOLOOP
            </span>
            <span className="text-[#3a3a3f]">|</span>
            <span className="spacex-caption">CAMPUS RECOVERY PROTOCOL</span>
          </div>

          <div className="flex items-center gap-4 spacex-caption">
            <span>CPCB 2022 COMPLIANT</span>
            <span>•</span>
            <span>NAAC CRITERION 7.1.3</span>
            <span>•</span>
            <span className="text-[#ffffff]">ZERO WASTE TO LANDFILL</span>
          </div>
        </div>
      </footer>

      {/* ALL MODALS (Mounted & Controlled In-Place) */}
      <RegisterItemModal
        isOpen={isRegisterOpen}
        onClose={() => {
          setIsRegisterOpen(false);
          setSelectedCatalogItem(null);
        }}
        onSuccess={handleRegisterSuccess}
        initialItem={selectedCatalogItem}
      />

      <SchedulePickupModal
        item={selectedItem}
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSuccess={handleActionSuccess}
      />

      <QrDisplayModal
        item={selectedItem}
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        onSchedule={(item) => {
          setSelectedItem(item);
          setIsScheduleOpen(true);
        }}
      />

      <StatusTrackerModal
        itemId={selectedItemId}
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        onViewQr={(item) => {
          setSelectedItem(item);
          setIsQrOpen(true);
        }}
      />

      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        availableItems={items}
      />

      <CollectWeightModal
        item={selectedItem}
        isOpen={isCollectOpen}
        onClose={() => setIsCollectOpen(false)}
        onSuccess={handleActionSuccess}
      />

      <HandoverRecyclerModal
        item={selectedItem}
        isOpen={isHandoverOpen}
        onClose={() => setIsHandoverOpen(false)}
        onSuccess={handleActionSuccess}
      />

      <VerifyRecycledModal
        item={selectedItem}
        isOpen={isRecycleOpen}
        onClose={() => setIsRecycleOpen(false)}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import NotificationModal from './NotificationModal';
import {
  Bell,
  LogOut,
  Plus,
  QrCode,
  ChevronDown,
  Menu,
  X,
  Trophy,
  BarChart2,
  FileText,
  Sparkles,
  MapPin,
  ShieldCheck,
  Building2,
  Code2,
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenRegister,
  onOpenScanner,
}) {
  const { user, logout } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      api.getNotifications({ all: user.role === 'admin' ? 'true' : 'false' })
        .then((res) => {
          if (res.success && res.notifications) {
            setUnreadCount(res.notifications.filter((n) => !n.read).length);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const PRIMARY_NAV = [
    { id: 'dashboard', label: 'OVERVIEW' },
    { id: 'catalog', label: 'CATALOG' },
    { id: 'requests', label: 'OPERATIONS' },
    { id: 'map', label: 'CAMPUS MAP' },
    { id: 'carbon', label: 'CARBON' },
    { id: 'report', label: 'NAAC REPORT' },
    { id: 'compliance', label: 'COMPLIANCE' },
    { id: 'partners', label: 'PARTNERS' },
    { id: 'developers', label: 'API' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#000000]/95 backdrop-blur-md border-b border-[#27272a] text-[#ffffff]">
      {/* SpaceX Ultra-Clean Single-Tier Navbar */}
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
        
        {/* Brand: SpaceX-style bold geometric typography */}
        <div
          onClick={() => {
            setActiveTab('dashboard');
            setIsMobileMenuOpen(false);
          }}
          className="cursor-pointer select-none flex items-center gap-2 group"
        >
          <span className="font-['Barlow_Condensed'] text-2xl font-black tracking-[4px] text-[#ffffff] uppercase transition-transform duration-300 group-hover:scale-105">
            ECOLOOP
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-white opacity-60 ml-0.5" />
        </div>

        {/* Center: SpaceX Clean Uppercase Horizontal Links (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          {PRIMARY_NAV.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`cursor-pointer bg-transparent border-0 p-0 text-[13px] font-['Barlow_Condensed'] font-bold tracking-[1.4px] uppercase transition-all duration-200 relative py-1 ${
                  isActive
                    ? 'text-[#ffffff] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#ffffff]'
                    : 'text-[#888891] hover:text-[#ffffff]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Boxed Dropdown Button matching "UPCOMING LAUNCHES ⌄" */}
        <div className="flex items-center gap-3">
          
          {/* Quick Register Ghost Button (Desktop) */}
          <button
            onClick={onOpenRegister}
            className="hidden sm:inline-flex btn-spacex py-1.5 px-3 text-[12px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Item</span>
          </button>

          {/* SpaceX Styled Box Dropdown Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="spacex-dropdown-box cursor-pointer"
              aria-expanded={isDropdownOpen}
            >
              <span className="font-['Barlow_Condensed'] text-[12px] font-bold tracking-[1.3px]">
                {user ? `MISSION TELEMETRY` : `ACTIONS`}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Popover */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#09090b] border border-[#3a3a3f] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Telemetry Card */}
                {user && (
                  <div className="border-b border-[#27272a] pb-3 mb-3">
                    <div className="spacex-caption text-[11px] text-[#888891]">STATION TELEMETRY</div>
                    <div className="font-mono text-xs text-[#ffffff] font-semibold mt-0.5 uppercase">
                      [{user.role}] {user.name}
                    </div>
                    {user.hostel && (
                      <div className="text-[11px] text-[#888891] font-mono mt-0.5">
                        HOSTEL: {user.hostel}
                      </div>
                    )}
                    {user.role === 'student' && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#ffffff]/10 border border-[#ffffff]/20 text-[11px] font-mono text-[#ffffff]">
                        <span>BALANCE:</span>
                        <strong>{user.points || 0} PTS</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* Dropdown Actions */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenRegister();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-['Barlow_Condensed'] uppercase tracking-[1px] text-[#f0f0fa] hover:text-[#ffffff] hover:bg-[#ffffff]/10 transition-colors border-0 bg-transparent cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#ffffff]" />
                    <span>Register E-Waste Item</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenScanner();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-['Barlow_Condensed'] uppercase tracking-[1px] text-[#f0f0fa] hover:text-[#ffffff] hover:bg-[#ffffff]/10 transition-colors border-0 bg-transparent cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#ffffff]" />
                    <span>Hardware QR Scanner</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsNotifOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-['Barlow_Condensed'] uppercase tracking-[1px] text-[#f0f0fa] hover:text-[#ffffff] hover:bg-[#ffffff]/10 transition-colors border-0 bg-transparent cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-3.5 h-3.5 text-[#ffffff]" />
                      <span>Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-[#ffffff] text-[#000000] font-mono text-[10px] font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setActiveTab('leaderboard');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-['Barlow_Condensed'] uppercase tracking-[1px] text-[#f0f0fa] hover:text-[#ffffff] hover:bg-[#ffffff]/10 transition-colors border-0 bg-transparent cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5 text-[#ffffff]" />
                    <span>Hostel Leaderboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setActiveTab('analytics');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-['Barlow_Condensed'] uppercase tracking-[1px] text-[#f0f0fa] hover:text-[#ffffff] hover:bg-[#ffffff]/10 transition-colors border-0 bg-transparent cursor-pointer"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-[#ffffff]" />
                    <span>Campus Analytics</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setActiveTab('story');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-['Barlow_Condensed'] uppercase tracking-[1px] text-[#f0f0fa] hover:text-[#ffffff] hover:bg-[#ffffff]/10 transition-colors border-0 bg-transparent cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#ffffff]" />
                    <span>Impact Certificate Story</span>
                  </button>
                </div>

                {/* Sign Out Option */}
                {user && (
                  <div className="border-t border-[#27272a] pt-2 mt-2">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-['Barlow_Condensed'] uppercase tracking-[1.2px] text-[#888891] hover:text-[#ffffff] hover:bg-red-950/20 transition-colors border-0 bg-transparent cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[#ffffff] hover:text-white bg-transparent border-0 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#000000] border-t border-[#27272a] px-6 py-4 space-y-2 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#27272a]">
            {PRIMARY_NAV.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left py-2 px-3 text-xs font-['Barlow_Condensed'] font-bold tracking-[1.2px] uppercase transition-colors border ${
                    isActive
                      ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                      : 'border-transparent text-[#888891] hover:text-[#ffffff]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenRegister();
              }}
              className="flex-1 btn-spacex text-xs py-2"
            >
              <Plus className="w-3 h-3" />
              <span>Register</span>
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenScanner();
              }}
              className="flex-1 btn-spacex text-xs py-2"
            >
              <QrCode className="w-3 h-3" />
              <span>Scanner</span>
            </button>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      <NotificationModal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </header>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import NotificationModal from './NotificationModal';
import {
  Bell,
  LogOut,
  Plus,
  QrCode,
  User,
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

  const NAV_ITEMS = [
    { id: 'dashboard', label: user?.role === 'student' ? 'Overview' : 'Dashboard' },
    { id: 'catalog', label: '50+ Products' },
    { id: 'requests', label: 'Operations' },
    { id: 'map', label: 'Campus Map' },
    { id: 'carbon', label: 'Carbon Credits' },
    { id: 'story', label: 'Impact Story' },
    { id: 'report', label: 'NAAC Report' },
    { id: 'compliance', label: 'Compliance SLA' },
    { id: 'partners', label: 'Partners Portal' },
    { id: 'developers', label: 'REST API' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#000000] border-b border-[#3a3a3f]">
      {/* Top Telemetry Strip */}
      <div className="border-b border-[#3a3a3f] px-6 py-2 text-xs bg-[#000000]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffffff] inline-block" />
            <span className="spacex-caption">MISSION ACTIVE:</span>
            <span className="font-mono text-xs text-[#f0f0fa] tracking-wider uppercase">
              [{user?.role || 'USER'}] {user?.name || ''}
            </span>
            {user?.hostel && (
              <span className="spacex-caption hidden md:inline">
                // STATION: {user.hostel}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user?.role === 'student' && (
              <span className="spacex-caption hidden sm:inline">
                CREDITS: <strong className="text-[#ffffff]">{user.points || 0} PTS</strong>
              </span>
            )}
            <button
              onClick={logout}
              className="text-[#5a5a5f] hover:text-[#ffffff] text-[11px] font-bold uppercase tracking-[1.17px] transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-0 p-0"
              title="Sign Out"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Command Bar */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="cursor-pointer select-none flex items-center gap-3"
        >
          <span className="font-['D-DIN-Bold'] text-2xl font-black tracking-[3px] text-[#ffffff] uppercase">
            ECOLOOP
          </span>
          <span className="spacex-caption hidden sm:inline border-l border-[#3a3a3f] pl-3 py-0.5">
            Campus Closed Loop
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenRegister}
            className="btn-spacex"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register E-Waste</span>
          </button>

          <button
            onClick={onOpenScanner}
            className="btn-spacex"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scanner</span>
          </button>

          <button
            onClick={() => setIsNotifOpen(true)}
            className="p-2.5 rounded-full border border-[#3a3a3f] hover:border-[#ffffff] text-[#f0f0fa] hover:text-[#ffffff] transition-colors relative cursor-pointer bg-transparent"
            title="Telemetry Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#ffffff] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* SpaceX Mission Navigation Track */}
      <div className="border-t border-[#3a3a3f] px-6 bg-[#000000]">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 text-[12px] font-['D-DIN-Bold'] uppercase tracking-[1.17px] whitespace-nowrap transition-all cursor-pointer rounded-full border ${
                  isActive
                    ? 'border-[#ffffff] text-[#000000] bg-[#ffffff]'
                    : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff] hover:border-[#3a3a3f]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications Modal */}
      <NotificationModal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </header>
  );
}

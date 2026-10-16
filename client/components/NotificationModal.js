'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Bell,
  X,
  Mail,
  Smartphone,
  CheckCircle2,
  Send,
  AlertCircle,
  RefreshCw,
  Scissors,
  ChevronDown,
} from 'lucide-react';

export default function NotificationModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'test'
  const [cutIds, setCutIds] = useState(new Set()); // Cut / dismissed notifications
  const [expandedIds, setExpandedIds] = useState(new Set()); // Expanded notification text

  // Test Dispatch Form
  const [testEmail, setTestEmail] = useState(user?.email || '');
  const [testPhone, setTestPhone] = useState(user?.phone || '+919876543210');
  const [testTitle, setTestTitle] = useState('E-Waste Pipeline Real-Time Alert');
  const [testMessage, setTestMessage] = useState(
    'Consignment verified! Hazardous materials separated and precious metals reclaimed.'
  );
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications({ all: user?.role === 'admin' ? 'true' : 'false' });
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (e) {
      console.warn('Could not load notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      if (user?.email) setTestEmail(user.email);
      if (user?.phone) setTestPhone(user.phone);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.warn('Error marking read:', e);
    }
  };

  // Cut single notification
  const handleCutNotification = (e, id) => {
    e.stopPropagation();
    setCutIds((prev) => new Set([...prev, id]));
  };

  // Cut all notifications
  const handleCutAll = () => {
    const all = new Set(notifications.map((n) => n._id));
    setCutIds(all);
  };

  // Toggle cutting text vs expanding
  const toggleTextCut = (e, id) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const visibleNotifications = notifications.filter((n) => !cutIds.has(n._id));

  const handleSendTest = async (e) => {
    e.preventDefault();
    setTestLoading(true);
    setTestError('');
    setTestResult(null);

    try {
      const res = await api.sendTestNotification({
        email: testEmail,
        phone: testPhone,
        title: testTitle,
        message: testMessage,
      });

      if (res.success) {
        setTestResult(res);
        loadNotifications();
      } else {
        setTestError(res.message || 'Failed to dispatch test notification');
      }
    } catch (err) {
      setTestError(err.message || 'Gateway network error');
    } finally {
      setTestLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#0a0a0a] border border-[#3a3a3f] max-w-xl w-full overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="border-b border-[#3a3a3f] p-6 flex items-center justify-between shrink-0 bg-[#000000]">
          <div>
            <div className="spacex-caption">// REAL-TIME MISSION TELEMETRY ALERTS</div>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider">
                NOTIFICATION CENTER
              </h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 border border-[#ffffff] text-[#000000] bg-[#ffffff] text-[10px] font-['D-DIN-Bold'] uppercase">
                  {unreadCount} NEW
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {notifications.length > 0 && (
              <button
                onClick={handleCutAll}
                className="btn-spacex btn-spacex-muted py-1.5 px-3 text-xs"
                title="Cut & clear all telemetry alerts"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>CUT ALL</span>
              </button>
            )}
            <button
              onClick={loadNotifications}
              className="text-[#5a5a5f] hover:text-[#ffffff] transition-colors p-1"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-[#5a5a5f] hover:text-[#ffffff] transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 bg-[#000000] border-b border-[#3a3a3f] p-2 gap-2 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`py-2 px-3 uppercase font-['D-DIN-Bold'] tracking-wider rounded-full border transition-all ${
              activeTab === 'list'
                ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff]'
            }`}
          >
            Activity Feed ({visibleNotifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('test')}
            className={`py-2 px-3 uppercase font-['D-DIN-Bold'] tracking-wider rounded-full border transition-all ${
              activeTab === 'test'
                ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                : 'border-transparent text-[#5a5a5f] hover:text-[#ffffff]'
            }`}
          >
            Gateway Sandbox
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'list' ? (
            <div className="space-y-3">
              {visibleNotifications.length === 0 ? (
                <div className="p-12 text-center text-[#5a5a5f] space-y-2">
                  <p className="spacex-caption">NO ACTIVE TELEMETRY RECEIPTS</p>
                  <p className="text-xs text-[#5a5a5f] font-mono">
                    All notifications cut or cleared. New transmissions trigger upon verification and collection.
                  </p>
                </div>
              ) : (
                visibleNotifications.map((notif) => {
                  const isExpanded = expandedIds.has(notif._id);
                  const isLong = (notif.message || '').length > 110;
                  const displayMessage = isLong && !isExpanded
                    ? notif.message.slice(0, 105) + '...'
                    : notif.message;

                  return (
                    <div
                      key={notif._id}
                      onClick={() => !notif.read && handleMarkRead(notif._id)}
                      className={`p-4 border transition-all ${
                        notif.read
                          ? 'bg-[#000000] border-[#3a3a3f]'
                          : 'bg-[#0a0a0a] border-[#ffffff]'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-['D-DIN-Bold'] text-sm uppercase tracking-wider text-[#ffffff] flex items-center gap-2">
                              {notif.title}
                              {!notif.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ffffff] inline-block" />
                              )}
                            </h4>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-[#5a5a5f] font-mono">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {/* Cut / Dismiss Single Notification */}
                              <button
                                type="button"
                                onClick={(e) => handleCutNotification(e, notif._id)}
                                className="px-2 py-0.5 border border-[#3a3a3f] hover:border-[#ffffff] text-[#5a5a5f] hover:text-[#ffffff] text-[10px] font-['D-DIN-Bold'] uppercase transition rounded-full flex items-center gap-1"
                                title="Cut / Dismiss this notification"
                              >
                                <Scissors className="w-3 h-3" />
                                <span>CUT</span>
                              </button>
                            </div>
                          </div>

                          {/* Message with Cut / Expand text options */}
                          <div className="text-xs text-[#f0f0fa] leading-relaxed font-mono">
                            <span>{displayMessage}</span>
                            {isLong && (
                              <button
                                type="button"
                                onClick={(e) => toggleTextCut(e, notif._id)}
                                className="ml-2 spacex-caption text-[#ffffff] hover:underline inline-flex items-center gap-1 cursor-pointer"
                              >
                                {isExpanded ? (
                                  <>
                                    <Scissors className="w-3 h-3" />
                                    <span>CUT TEXT (SHOW LESS)</span>
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-3 h-3" />
                                    <span>READ FULL TEXT</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Gateway Badges */}
                          <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] font-mono text-[#5a5a5f]">
                            <span>EMAIL: {notif.recipientEmail} [DISPATCHED]</span>
                            <span>•</span>
                            <span>SMS: {notif.recipientPhone || '+919876543210'} [DISPATCHED]</span>
                            {notif.trackingCode && (
                              <>
                                <span>•</span>
                                <span className="text-[#ffffff]">TAG: {notif.trackingCode}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Gateway Test Form */
            <form onSubmit={handleSendTest} className="space-y-6">
              <div className="p-4 bg-[#000000] border border-[#3a3a3f] text-xs">
                <span className="spacex-caption block mb-1">// GATEWAY DISPATCH CONSOLE</span>
                <p className="text-[#5a5a5f] font-mono text-xs">
                  Transmits live telemetry payload across connected SMTP / SMS gateway pipelines.
                </p>
              </div>

              {testError && (
                <div className="p-3 border border-[#ffffff] text-[#ffffff] text-xs flex items-center gap-2 bg-[#000000]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-mono">{testError}</span>
                </div>
              )}

              {testResult && (
                <div className="p-4 border border-[#ffffff] bg-[#000000] text-xs space-y-1 font-mono">
                  <div className="flex items-center gap-2 text-[#ffffff] font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>REAL-TIME GATEWAYS DISPATCHED</span>
                  </div>
                  <p className="text-[#5a5a5f]">
                    Email via {testResult.emailResult?.provider} • SMS via {testResult.smsResult?.provider}
                  </p>
                </div>
              )}

              <div>
                <label className="block spacex-caption mb-2">
                  RECIPIENT EMAIL (SENDGRID / SMTP)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#5a5a5f] absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="student@ecoloop.campus"
                    className="w-full pl-9 pr-4 py-3 bg-[#000000] border border-[#3a3a3f] text-[#ffffff] text-xs font-mono focus:border-[#ffffff]"
                  />
                </div>
              </div>

              <div>
                <label className="block spacex-caption mb-2">
                  RECIPIENT PHONE (TWILIO / SMS)
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-[#5a5a5f] absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full pl-9 pr-4 py-3 bg-[#000000] border border-[#3a3a3f] text-[#ffffff] text-xs font-mono focus:border-[#ffffff]"
                  />
                </div>
              </div>

              <div>
                <label className="block spacex-caption mb-2">
                  DISPATCH TITLE
                </label>
                <input
                  type="text"
                  required
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-[#000000] border border-[#3a3a3f] text-[#ffffff] text-xs font-mono focus:border-[#ffffff]"
                />
              </div>

              <div>
                <label className="block spacex-caption mb-2">
                  MESSAGE BODY
                </label>
                <textarea
                  rows={2}
                  required
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-[#000000] border border-[#3a3a3f] text-[#f0f0fa] text-xs focus:border-[#ffffff]"
                />
              </div>

              <div className="pt-2 border-t border-[#3a3a3f]">
                <button
                  type="submit"
                  disabled={testLoading}
                  className="w-full btn-spacex py-3"
                >
                  {testLoading ? (
                    <span>TRANSMITTING TELEMETRY TO GATEWAYS...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>DISPATCH TELEMETRY NOTIFICATION</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

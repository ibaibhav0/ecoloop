'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Check,
  RefreshCw,
  KeyRound,
} from 'lucide-react';

export default function LoginGate({ onExploreCatalog }) {
  const { login, sendOtp, registerWithOtp } = useAuth();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regStep, setRegStep] = useState(1);
  const [regRole, setRegRole] = useState('student'); // 'student' | 'college'
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [regHostel, setRegHostel] = useState('Nandani');
  const [regDept, setRegDept] = useState('Computer Science & Engineering');
  const [regPhone, setRegPhone] = useState('');
  const [devOtpCode, setDevOtpCode] = useState(null);

  // Handle standard login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!loginEmail || !loginPassword) {
      setFeedback({ type: 'error', message: 'Enter both your email and password.' });
      return;
    }
    setLoading(true);
    const res = await login(loginEmail.trim(), loginPassword);
    setLoading(false);
    if (!res.success) {
      setFeedback({ type: 'error', message: res.message || 'Authentication failed. Check credentials.' });
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!regEmail || !regEmail.includes('@')) {
      setFeedback({ type: 'error', message: 'Provide a valid institutional or personal email address.' });
      return;
    }
    if (!regName.trim()) {
      setFeedback({ type: 'error', message: 'Provide your full name or department name.' });
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    const res = await sendOtp(regEmail.trim().toLowerCase(), 'registration');
    setLoading(false);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `OTP dispatched to ${regEmail}. Enter verification code below.`,
      });
      if (res.devOtp) {
        setDevOtpCode(res.devOtp);
      }
      setRegStep(2);
    } else {
      setFeedback({ type: 'error', message: res.message || 'Failed to dispatch verification code.' });
    }
  };

  // Step 2: Verify OTP & Register
  const handleVerifyOtpAndRegister = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!regOtp || regOtp.length !== 6) {
      setFeedback({ type: 'error', message: 'Enter the 6-digit verification code.' });
      return;
    }

    setLoading(true);
    const payload = {
      email: regEmail.trim().toLowerCase(),
      otp: regOtp.trim(),
      name: regName.trim(),
      password: regPassword,
      role: regRole,
      hostel: regRole === 'student' ? regHostel : 'Yourspace',
      department: regDept,
      phone: regPhone,
    };

    const res = await registerWithOtp(payload);
    setLoading(false);

    if (!res.success) {
      setFeedback({ type: 'error', message: res.message || 'OTP verification failed.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#f0f0fa] flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-[#3a3a3f] px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-['D-DIN-Bold'] text-2xl tracking-[3px] text-[#ffffff] uppercase">
              ECOLOOP
            </span>
            <span className="text-[#3a3a3f]">/</span>
            <span className="spacex-caption">CLOSED LOOP SYSTEM</span>
          </div>

          {onExploreCatalog && (
            <button onClick={onExploreCatalog} className="btn-spacex">
              <span>Catalog (55+)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Full-Bleed Content */}
      <main className="max-w-7xl mx-auto px-6 py-16 w-full flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Mission Overview */}
          <div className="lg:col-span-6 space-y-8">
            <div className="spacex-caption">// MISSION OBJECTIVE: 0% LANDFILL</div>

            <h1 className="font-['D-DIN-Bold'] text-5xl md:text-7xl font-black text-[#ffffff] tracking-tight uppercase leading-[0.95]">
              CAMPUS E-WASTE RECOVERY
            </h1>

            <p className="text-[#f0f0fa] text-base leading-relaxed max-w-xl">
              Precision material reclamation across student hostels and institutional laboratories. Decommissioning computational hardware, scientific instrumentation, and consumer electronics under statutory CPCB Rules 2022.
            </p>

            <div className="border-t border-[#3a3a3f] pt-8 grid grid-cols-2 gap-8 max-w-lg">
              <div>
                <div className="font-['D-DIN-Bold'] text-3xl font-bold text-[#ffffff] uppercase tracking-wider">
                  01 // STUDENT
                </div>
                <p className="spacex-caption mt-2">
                  Personal devices, certified weight ledger, real-time CO2 offset telemetry.
                </p>
              </div>

              <div>
                <div className="font-['D-DIN-Bold'] text-3xl font-bold text-[#ffffff] uppercase tracking-wider">
                  02 // LABS
                </div>
                <p className="spacex-caption mt-2">
                  Batch lab decommissioning, server clusters, NAAC Form-6 audit documentation.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Austere Terminal Auth Box */}
          <div className="lg:col-span-6 border border-[#3a3a3f] bg-[#0a0a0a] p-8 md:p-12">
            
            {/* Mode Switcher */}
            <div className="flex border-b border-[#3a3a3f] pb-6 mb-8 gap-8">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setFeedback(null);
                }}
                className={`text-sm font-['D-DIN-Bold'] uppercase tracking-[1.17px] pb-2 transition-colors cursor-pointer border-0 p-0 ${
                  activeTab === 'login'
                    ? 'text-[#ffffff] border-b-2 border-[#ffffff]'
                    : 'text-[#5a5a5f] hover:text-[#ffffff]'
                }`}
              >
                01 // Authenticate
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setFeedback(null);
                }}
                className={`text-sm font-['D-DIN-Bold'] uppercase tracking-[1.17px] pb-2 transition-colors cursor-pointer border-0 p-0 ${
                  activeTab === 'register'
                    ? 'text-[#ffffff] border-b-2 border-[#ffffff]'
                    : 'text-[#5a5a5f] hover:text-[#ffffff]'
                }`}
              >
                02 // Create Account (OTP)
              </button>
            </div>

            {/* Status Message */}
            {feedback && (
              <div className="mb-6 p-4 border border-[#3a3a3f] bg-[#000000] text-xs space-y-2">
                <div className="spacex-caption">// SYSTEM NOTICE:</div>
                <div className="text-[#ffffff] font-mono">{feedback.message}</div>
                {devOtpCode && feedback.type === 'success' && (
                  <div className="mt-2 text-xs font-mono text-[#ffffff] border-t border-[#3a3a3f] pt-2">
                    DISPATCHED 6-DIGIT CODE: <strong className="text-white text-sm tracking-widest">{devOtpCode}</strong>
                  </div>
                )}
              </div>
            )}

            {/* TAB 1: SIGN IN */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                  <label className="block mb-2">EMAIL IDENTIFIER</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="identifier@ecoloop.campus"
                    className="w-full px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block mb-2">PASSWORD</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-spacex w-full py-3"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>AUTHENTICATING...</span>
                      </>
                    ) : (
                      <>
                        <span>ENTER SYSTEM</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: REGISTER WITH EMAIL OTP */}
            {activeTab === 'register' && (
              <div className="space-y-6">
                {/* Sector Selector */}
                <div>
                  <label className="block mb-2">OPERATIONAL SECTOR</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRegRole('student')}
                      className={`p-3 text-left border cursor-pointer text-xs uppercase tracking-[0.96px] font-['D-DIN-Bold'] ${
                        regRole === 'student'
                          ? 'border-[#ffffff] text-[#ffffff] bg-[#000000]'
                          : 'border-[#3a3a3f] text-[#5a5a5f] hover:text-[#ffffff] bg-transparent'
                      }`}
                    >
                      [+] Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('college')}
                      className={`p-3 text-left border cursor-pointer text-xs uppercase tracking-[0.96px] font-['D-DIN-Bold'] ${
                        regRole === 'college'
                          ? 'border-[#ffffff] text-[#ffffff] bg-[#000000]'
                          : 'border-[#3a3a3f] text-[#5a5a5f] hover:text-[#ffffff] bg-transparent'
                      }`}
                    >
                      [+] College / Dept
                    </button>
                  </div>
                </div>

                {regStep === 1 ? (
                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div>
                      <label className="block mb-2">
                        {regRole === 'student' ? 'FULL NAME' : 'DEPARTMENT / LAB LEAD'}
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder={regRole === 'student' ? 'Baibhav Kumar' : 'CSE Lab Head'}
                        className="w-full px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="block mb-2">EMAIL ADDRESS (VERIFICATION TARGET)</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="contributor@campus.edu"
                        className="w-full px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="block mb-2">CREATE PASSWORD (MIN 6 CHARACTERS)</label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-4 py-3"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-spacex w-full py-3"
                    >
                      {loading ? 'DISPATCHING...' : 'DISPATCH 6-DIGIT OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtpAndRegister} className="space-y-5">
                    <div>
                      <label className="block mb-2">ENTER 6-DIGIT VERIFICATION CODE</label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={regOtp}
                        onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full px-4 py-3 font-mono text-center tracking-[8px] text-lg text-[#ffffff]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {regRole === 'student' ? (
                        <div>
                          <label className="block mb-2">CAMPUS STATION</label>
                          <select
                            value={regHostel}
                            onChange={(e) => setRegHostel(e.target.value)}
                            className="w-full px-3 py-3"
                          >
                            <option value="Nandani">Nandani</option>
                            <option value="Saupernikha">Saupernikha</option>
                            <option value="Kumardhara">Kumardhara</option>
                            <option value="Netravati">Netravati</option>
                            <option value="Day Scholar">Day Scholar</option>
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block mb-2">DEPARTMENT</label>
                          <input
                            type="text"
                            value={regDept}
                            onChange={(e) => setRegDept(e.target.value)}
                            className="w-full px-3 py-3"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block mb-2">CONTACT PHONE</label>
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+91..."
                          className="w-full px-3 py-3"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setRegStep(1)}
                        className="btn-spacex-muted py-3 px-4 text-xs"
                      >
                        BACK
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-spacex flex-1 py-3"
                      >
                        {loading ? 'VERIFYING...' : 'VERIFY & INITIALIZE'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#3a3a3f] px-6 py-6 text-xs text-[#5a5a5f]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 spacex-caption">
          <span>CPCB E-WASTE MANAGEMENT RULES 2022</span>
          <span>AEROSPACE-GRADE PROTOCOL • ZERO LANDFILL</span>
        </div>
      </footer>
    </div>
  );
}

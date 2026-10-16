'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  X,
  Mail,
  Search,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const HOSTELS = ['Nandani', 'Kaveri', 'Kumardhara', 'Saupernikha', 'Shambhavi', 'Netravati'];

const ERP_DEMO_STUDENTS = [
  { name: 'Priya Sharma', email: 'priya@ecoloop.campus', hostel: 'Shambhavi', dept: 'Electronics & Comm.' },
  { name: 'Rohit Shetty', email: 'rohit@ecoloop.campus', hostel: 'Kumardhara', dept: 'Mechanical Eng.' },
  { name: 'Divya Hegde', email: 'divya@ecoloop.campus', hostel: 'Saupernikha', dept: 'Biotechnology' },
  { name: 'Karthik Rao', email: 'karthik@ecoloop.campus', hostel: 'Netravati', dept: 'AI & Data Science' },
];

export default function LoginSignupModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [hostel, setHostel] = useState('Nandani');

  // Campus ERP Verification State
  const [erpLoading, setErpLoading] = useState(false);
  const [erpRecord, setErpRecord] = useState(null);
  const [erpError, setErpError] = useState('');

  if (!isOpen) return null;

  const handleEmailLookup = async (targetEmail) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErpRecord(null);
      setErpError('');
      return;
    }

    setErpLoading(true);
    setErpError('');

    try {
      const res = await api.lookupErpStudent(cleanEmail);
      if (res.success && res.student) {
        setErpRecord(res.student);
        setName(res.student.name);
        setHostel(res.student.hostel);
        setErpError('');
      } else {
        setErpRecord(null);
        setErpError(res.message || 'No record found in campus ERP');
      }
    } catch (err) {
      setErpRecord(null);
      setErpError(err.message || 'Failed to verify with Campus ERP API');
    } finally {
      setErpLoading(false);
    }
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    if (role === 'student') {
      const clean = val.trim().toLowerCase();
      if (clean.includes('@') && clean.split('@')[1].length >= 3) {
        handleEmailLookup(clean);
      } else {
        setErpRecord(null);
        setErpError('');
      }
    }
  };

  const selectErpDemoStudent = (demo) => {
    setEmail(demo.email);
    handleEmailLookup(demo.email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSignup && role === 'student') {
      if (!erpRecord) {
        setError('Please enter a valid, enrolled campus email verified in the Campus ERP roster.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignup) {
        const payload = {
          name: erpRecord ? erpRecord.name : name,
          email,
          password,
          role,
          hostel: erpRecord ? erpRecord.hostel : hostel,
        };

        const res = await register(payload);
        if (res.success) {
          onClose();
        } else {
          setError(res.message);
        }
      } else {
        const res = await login(email, password);
        if (res.success) {
          onClose();
        } else {
          setError(res.message);
        }
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#0a0a0a] border border-[#3a3a3f] max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="border-b border-[#3a3a3f] p-6 flex items-center justify-between shrink-0 bg-[#000000]">
          <div>
            <div className="spacex-caption">// IDENTITY &amp; ACCESS CONTROL</div>
            <h2 className="font-['D-DIN-Bold'] text-2xl text-[#ffffff] uppercase tracking-wider mt-1">
              {isSignup ? 'ENROLL IN ECOLOOP' : 'AUTHENTICATE SESSION'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#5a5a5f] hover:text-[#ffffff] transition-colors p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 border border-[#ffffff] text-[#ffffff] text-xs flex items-center gap-2 bg-[#000000]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-mono">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selector (in Signup mode) */}
            {isSignup && (
              <div>
                <label className="block spacex-caption mb-2">OPERATIONAL PROFILE</label>
                <div className="grid grid-cols-4 gap-2">
                  {['student', 'collector', 'admin', 'recycler'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setRole(r);
                        setErpRecord(null);
                        setErpError('');
                      }}
                      className={`p-2.5 uppercase font-['D-DIN-Bold'] text-xs tracking-wider border rounded-none transition-all ${
                        role === r
                          ? 'border-[#ffffff] bg-[#ffffff] text-[#000000]'
                          : 'border-[#3a3a3f] bg-[#000000] text-[#5a5a5f] hover:text-[#ffffff]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="spacex-caption">CAMPUS EMAIL IDENTIFIER</label>
                <span className="spacex-caption text-[#ffffff]">
                  @ecoloop.campus / @nmamit.in
                </span>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#5a5a5f] absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="priya@ecoloop.campus"
                  className="w-full pl-9 pr-24 py-3 bg-[#000000] border border-[#3a3a3f] text-[#ffffff] text-xs font-mono focus:border-[#ffffff]"
                />
                {isSignup && role === 'student' && (
                  <button
                    type="button"
                    onClick={() => handleEmailLookup(email)}
                    disabled={erpLoading || !email.includes('@')}
                    className="absolute right-2 top-2 btn-spacex py-1 px-3 text-[10px]"
                  >
                    {erpLoading ? '...' : 'VERIFY ERP'}
                  </button>
                )}
              </div>
            </div>

            {/* Pre-Approved Student Picker for 1-Click ERP auto-fetch test */}
            {isSignup && role === 'student' && !erpRecord && (
              <div className="p-4 bg-[#000000] border border-[#3a3a3f] space-y-2">
                <div className="spacex-caption">
                  TEST ENROLLED ERP ROSTER (1-CLICK FILL):
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ERP_DEMO_STUDENTS.map((demo) => (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={() => selectErpDemoStudent(demo)}
                      className="p-2 border border-[#3a3a3f] hover:border-[#ffffff] text-left text-[11px] font-mono transition-colors rounded-none"
                    >
                      <div className="font-bold text-[#ffffff] uppercase">{demo.name}</div>
                      <div className="text-[#5a5a5f] truncate">{demo.email}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ERP Verified Card */}
            {erpRecord && (
              <div className="p-4 bg-[#000000] border border-[#ffffff] text-xs font-mono space-y-1">
                <div className="flex items-center gap-2 text-[#ffffff] font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CAMPUS ERP RECORD VERIFIED</span>
                </div>
                <p className="text-[#f0f0fa] pt-1">
                  NAME: {erpRecord.name} // STATION: {erpRecord.hostel} // DEPT: {erpRecord.dept}
                </p>
              </div>
            )}

            {isSignup && role !== 'student' && (
              <div>
                <label className="block spacex-caption mb-2">OPERATOR FULL NAME</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Command Officer Name"
                  className="w-full px-4 py-3 bg-[#000000] border border-[#3a3a3f] text-[#ffffff] text-xs font-mono focus:border-[#ffffff]"
                />
              </div>
            )}

            <div>
              <label className="block spacex-caption mb-2">ENCRYPTED CREDENTIAL / PASSWORD</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 bg-[#000000] border border-[#3a3a3f] text-[#ffffff] text-xs font-mono focus:border-[#ffffff]"
              />
            </div>

            <div className="pt-2 border-t border-[#3a3a3f] space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-spacex py-3"
              >
                {loading ? (
                  <span>AUTHENTICATING TELEMETRY...</span>
                ) : (
                  <span>{isSignup ? 'COMPLETE ENROLLMENT' : 'ESTABLISH SESSION'}</span>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError('');
                  }}
                  className="spacex-caption hover:text-[#ffffff] transition-colors"
                >
                  {isSignup ? '// ALREADY ENROLLED? AUTHENTICATE' : '// NEW RECOVERY OPERATOR? ENROLL PROFILE'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

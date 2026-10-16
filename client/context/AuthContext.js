'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = [];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from stored token on mount ONLY (No auto-login bypass!)
  useEffect(() => {
    const initAuth = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('ecoloop_token') : null;
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem('ecoloop_token');
            setUser(null);
          }
        } catch (e) {
          console.warn('Auth token verify error:', e);
          localStorage.removeItem('ecoloop_token');
          setUser(null);
        }
      } else {
        // Mandatory login: visitor must log in first!
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      if (res.success && res.token) {
        localStorage.setItem('ecoloop_token', res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Login failed. Check your ID and password.' };
    } catch (e) {
      return { success: false, message: e.message || 'Network error connecting to auth server' };
    }
  };

  const sendOtp = async (email, purpose = 'registration') => {
    try {
      return await api.sendOtp(email, purpose);
    } catch (e) {
      return { success: false, message: e.message || 'Failed to dispatch verification code' };
    }
  };

  const registerWithOtp = async (data) => {
    try {
      const res = await api.registerWithOtp(data);
      if (res.success && res.token) {
        localStorage.setItem('ecoloop_token', res.token);
        setUser(res.user);
        return { success: true, user: res.user, message: res.message };
      }
      return { success: false, message: res.message || 'OTP registration failed' };
    } catch (e) {
      return { success: false, message: e.message || 'Network error during registration' };
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ecoloop_token');
    }
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        sendOtp,
        registerWithOtp,
        logout,
        refreshUser,
        demoAccounts: [],
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

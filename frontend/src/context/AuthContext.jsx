/**
 * WellSense AI - Global Authentication & Role Context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('wellsense_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      api.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      return res.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const res = await api.register(userData);
      setUser(res.user);
      return res.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  // Quick switcher for demo and evaluation
  const loginAsDemo = async (role) => {
    const creds = {
      student: { email: 'student@wellsense.edu', pass: 'Student@123' },
      counsellor: { email: 'counsellor@wellsense.edu', pass: 'Counsellor@123' },
      admin: { email: 'admin@wellsense.edu', pass: 'Admin@123' },
    };
    const c = creds[role] || creds.student;
    return await login(c.email, c.pass);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      logout,
      refreshProfile,
      loginAsDemo,
      isAuthenticated: !!user,
      isStudent: user?.role === 'student',
      isCounsellor: user?.role === 'counsellor',
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

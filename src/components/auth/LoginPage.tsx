'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { UserRole } from '../../types/wellness';
import { AxionLogo } from '../common/AxionLogo';
import {
  User,
  Briefcase,
  Eye,
  EyeOff,
  ChevronDown,
  Zap
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, accounts, setToastNotification } = useWellness();
  const [email, setEmail] = useState('johnmicooh.ugot@axionhr.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAccount = accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
    if (targetAccount) {
      if (targetAccount.status === 'disabled') {
        setToastNotification(`Access Denied: Account for ${targetAccount.name} is currently disabled.`);
        return;
      }
      if (targetAccount.password && password !== '••••••••••••' && password !== targetAccount.password) {
        setToastNotification('Authentication Failed: Incorrect password provided for this account.');
        return;
      }
    }

    const roleToLogin: UserRole = targetAccount
      ? targetAccount.role
      : email.toLowerCase().includes('admin')
        ? 'admin'
        : email.toLowerCase().includes('hr')
          ? 'hr_manager'
          : 'employee';

    login(roleToLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      {/* Background Soft Floating Organic Blobs matching mockup */}
      <div className="absolute -top-16 -left-16 w-80 h-80 bg-blue-300/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Card Container */}
      <div className="w-full max-w-5xl bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/80 shadow-2xl shadow-blue-950/10 overflow-hidden p-6 sm:p-10 lg:p-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[560px]">

          {/* Left Column - Branding & Tagline */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full py-4 pr-0 lg:pr-6">
            <div>
              {/* Logo Badge */}
              <div className="flex items-center gap-3 mb-12">
                <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-blue-500/15 border border-slate-100">
                  <AxionLogo className="w-8 h-8" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Axion<span className="text-blue-600">HR</span>
                </span>
              </div>

              {/* Tagline & Subtitle matching layout */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                From Early Signs to a Safe Haven.
              </h1>
              <p className="text-sm text-slate-500 mt-4 leading-relaxed max-w-md">
                Continuous workplace well-being & burnout protection telemetry designed for modern teams. Safe, anonymous, and proactive.
              </p>
            </div>

            {/* Bottom Footer Links & Language Selector matching mockup */}
            <div className="mt-12 lg:mt-auto pt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2 bg-white/90 border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs text-slate-700 cursor-pointer hover:bg-slate-50 transition-all">
                <span className="text-base">🇺🇸</span>
                <span>English</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="flex items-center gap-4 text-slate-500">
                <a href="#" onClick={e => e.preventDefault()} className="hover:text-blue-600 transition-colors"></a>
                <a href="#" onClick={e => e.preventDefault()} className="hover:text-blue-600 transition-colors"></a>
                <a href="#" onClick={e => e.preventDefault()} className="hover:text-blue-600 transition-colors"></a>
              </div>
            </div>
          </div>

          {/* Right Column - Clean Floating Sign In / Sign Up Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 lg:p-9 border border-slate-100 shadow-xl shadow-slate-200/60">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Sign In
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your Workplace Well-being Platform
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Main Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/25 mt-2 cursor-pointer"
              >
                Sign In
              </button>
            </form>

            {/* Quick Demo Login Shortcut */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
              <span>Quick Demo Access:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => login('employee')}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-all flex items-center gap-1 cursor-pointer text-xs"
                >
                  <Zap className="w-3 h-3" /> Employee
                </button>
                <button
                  type="button"
                  onClick={() => login('hr_manager')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer text-xs"
                >
                  <Briefcase className="w-3 h-3" /> HR Manager
                </button>
                <button
                  type="button"
                  onClick={() => login('admin')}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 transition-all flex items-center gap-1 cursor-pointer text-xs"
                >
                  <User className="w-3 h-3" /> System Admin
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

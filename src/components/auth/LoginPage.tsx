'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { UserRole } from '../../types/wellness';
import {
  User,
  Briefcase,
  Eye,
  EyeOff,
  ChevronDown,
  Zap
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useWellness();
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');
  const [email, setEmail] = useState('johnmicooh.ugot@axionhr.com');
  const [password, setPassword] = useState('••••••••••••');
  const [repeatPassword, setRepeatPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'employee') {
      setEmail('johnmicooh.ugot@axionhr.com');
    } else {
      setEmail('hr.director@axionhr.com');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole);
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
              <div className="flex items-center gap-2.5 mb-12">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-600/30">
                  A
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
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
                <a href="#" onClick={e => e.preventDefault()} className="hover:text-blue-600 transition-colors">Terms</a>
                <a href="#" onClick={e => e.preventDefault()} className="hover:text-blue-600 transition-colors">Plans</a>
                <a href="#" onClick={e => e.preventDefault()} className="hover:text-blue-600 transition-colors">Contact Us</a>
              </div>
            </div>
          </div>

          {/* Right Column - Clean Floating Sign In / Sign Up Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 lg:p-9 border border-slate-100 shadow-xl shadow-slate-200/60">
            {/* Header & Role Switcher */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your Workplace Well-being Platform
                </p>
              </div>

              {/* Portal Mode Indicator Pill */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleRoleChange('employee')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedRole === 'employee'
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  Employee
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('hr_manager')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedRole === 'hr_manager'
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  HR Admin
                </button>
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
                  {!isSignUp && (
                    <a href="#" onClick={e => e.preventDefault()} className="text-[11px] font-medium text-slate-400 hover:text-blue-600">
                      Forgot Password?
                    </a>
                  )}
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

              {/* Repeat Password (If Sign Up) */}
              {isSignUp && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Repeat Password</label>
                  <input
                    type="password"
                    value={repeatPassword}
                    onChange={e => setRepeatPassword(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                    required
                  />
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={e => setAcceptTerms(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="acceptTerms" className="text-xs text-slate-500 cursor-pointer">
                  I accept the <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-bold hover:underline">Terms</a>
                </label>
              </div>



              {/* Main Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/25 mt-2"
              >
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </form>

            {/* Toggle Sign In / Sign Up Link */}
            <div className="mt-5 text-center text-xs text-slate-500">
              {isSignUp ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Sign Up
                  </button>
                </span>
              )}
            </div>

            {/* Quick Demo Login Shortcut */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Quick Demo Access:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => login('employee')}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-all flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" /> Employee
                </button>
                <button
                  type="button"
                  onClick={() => login('hr_manager')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all flex items-center gap-1"
                >
                  <Briefcase className="w-3 h-3" /> HR Admin
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

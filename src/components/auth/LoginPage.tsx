'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { UserRole } from '../../types/wellness';
import { 
  HeartHandshake, 
  User, 
  Briefcase, 
  Lock, 
  Mail, 
  ArrowRight, 
  Zap,
  CheckCircle2
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useWellness();
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');
  const [email, setEmail] = useState('johnmicooh.ugot@axionhr.com');
  const [password, setPassword] = useState('••••••••••••');

  const handleTabChange = (role: UserRole) => {
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Branding Pane (Deep Dark Blue - #0b192e) */}
        <div className="lg:col-span-5 bg-[#0b192e] text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Background Decorative Blob */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <HeartHandshake className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">
                  Axion<span className="text-blue-400">HR</span>
                </h1>
                <p className="text-xs text-slate-300 font-medium mt-0.5">Safe Haven Platform</p>
              </div>
            </div>

            <div className="space-y-4 my-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
                From Early Signs to a <span className="text-blue-400">Safe Haven</span>.
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                An AI-powered workplace well-being platform replacing occasional surveys with continuous, privacy-first insights, proactive physical guidance, and peer recognition.
              </p>
            </div>
          </div>

          {/* Feature Bullets */}
          <div className="space-y-2.5 pt-6 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>AI Burnout Risk Predictor & Telemetry</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>100% Anonymized HR Health Insights</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Work-Life Boundary Guard & Disconnect Mode</span>
            </div>
          </div>
        </div>

        {/* Right Authentication Form Pane */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to Your Workspace</h3>
              <p className="text-xs text-slate-500 mt-1">Select your account type to access your tailored dashboard.</p>
            </div>

            {/* Employee vs HR Role Selector Tabs */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => handleTabChange('employee')}
                className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  selectedRole === 'employee'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Employee Portal</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('hr_manager')}
                className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  selectedRole === 'hr_manager'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>HR Admin Portal</span>
              </button>
            </div>

            {/* Main Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Work Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <a href="#" onClick={e => e.preventDefault()} className="text-[11px] font-semibold text-blue-600 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 mt-2"
              >
                <span>Sign In to {selectedRole === 'employee' ? 'Employee Wellness Hub' : 'HR Executive Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Login Triggers */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
                Instant Demo Quick Login
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => login('employee')}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-800 hover:text-blue-700 font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-blue-600" />
                  <span>Demo Employee View</span>
                </button>
                <button
                  type="button"
                  onClick={() => login('hr_manager')}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-800 hover:text-blue-700 font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  <span>Demo HR Admin View</span>
                </button>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-6">
            Protected by AxionHR Safe Haven Enterprise Security & Anonymity Engine.
          </p>
        </div>
      </div>
    </div>
  );
};

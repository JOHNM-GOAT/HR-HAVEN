'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { UserRole, UserAccount } from '../../types/wellness';
import { AxionLogo } from '../common/AxionLogo';
import { Eye, EyeOff, Zap, Briefcase, User, Check } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, accounts, deletedAccounts, setToastNotification } = useWellness();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setToastNotification('Please enter your email and password to log in.');
      return;
    }

    // Check if account was deleted / archived in Recovery Vault
    const isDeleted = deletedAccounts.some(d => d.email.toLowerCase() === cleanEmail);
    if (isDeleted) {
      setToastNotification('Access Denied: This account has been deprovisioned. Please contact your Administrator to restore access.');
      return;
    }

    // Look for verified user account in the directory
    let targetAccount = accounts.find(a =>
      a.email.toLowerCase() === cleanEmail ||
      a.email.toLowerCase().split('@')[0] === cleanEmail
    );

    // Guaranteed root Administrator fallback if matching admin email/username
    if (!targetAccount && (cleanEmail === 'admin' || cleanEmail === 'admin@axionhr.com' || cleanEmail === 'admin@axion.com')) {
      targetAccount = {
        id: 'admin-001',
        name: 'System Administrator',
        email: 'admin@axionhr.com',
        password: 'admin',
        role: 'admin',
        department: 'Executive IT & Administration',
        status: 'active',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        createdAt: '2026-01-01',
        lastActive: 'Just now'
      };
    }

    // If account not created by an admin, reject login
    if (!targetAccount) {
      setToastNotification('Access Denied: No registered account found for this email. An Administrator must create your account first.');
      return;
    }

    if (targetAccount.status === 'disabled') {
      setToastNotification(`Access Denied: Account for ${targetAccount.name} is currently disabled.`);
      return;
    }

    // Admin password support (accepts 'admin', 'admin123', or configured password)
    if (targetAccount.role === 'admin' || targetAccount.email.toLowerCase() === 'admin@axionhr.com') {
      const validAdminPasswords = ['admin', 'admin123', 'password123', targetAccount.password].filter(Boolean);
      if (!validAdminPasswords.includes(cleanPassword)) {
        setToastNotification('Authentication Failed: Incorrect password provided for Admin.');
        return;
      }
    } else if (targetAccount.password && cleanPassword !== targetAccount.password) {
      setToastNotification('Authentication Failed: Incorrect password provided for this account.');
      return;
    }

    // Login successfully with verified account
    login(targetAccount.role, targetAccount);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white selection:bg-blue-600 selection:text-white font-sans">

      {/* LEFT COLUMN: Light Ice Blue / Pearl Blueprint Constellation Panel (Exact Match to Mockup) */}
      <div className="w-full lg:w-1/2 min-h-[480px] lg:min-h-screen relative overflow-hidden bg-gradient-to-br from-[#cbe2f8] via-[#e5f1fc] to-[#ffffff] flex flex-col justify-between p-8 sm:p-12 lg:p-14 select-none border-b lg:border-b-0 lg:border-r border-slate-200/80">

        {/* Subtle Blueprint Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-45"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(59, 130, 246, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '46px 46px'
          }}
        />

        {/* Constellation Network Geometry SVG (Plotted to Match Reference Image) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {/* Dashed line from top header node to right network node */}
          <line
            x1="35.5%"
            y1="10.5%"
            x2="65.5%"
            y2="38%"
            stroke="#94a3b8"
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />

          {/* Upper Left Constellation Branch */}
          <line
            x1="29.5%"
            y1="27%"
            x2="51.5%"
            y2="30.5%"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          <line
            x1="29.5%"
            y1="27%"
            x2="18.2%"
            y2="42%"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          <line
            x1="18.2%"
            y1="42%"
            x2="23.8%"
            y2="56%"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          <line
            x1="23.8%"
            y1="56%"
            x2="32.2%"
            y2="64.2%"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />

          {/* Long Diagonal Line to Bottom-Left Anchor */}
          <line
            x1="32.2%"
            y1="64.2%"
            x2="8%"
            y2="88%"
            stroke="#94a3b8"
            strokeWidth="1.2"
          />

          {/* Right Constellation Branch */}
          <line
            x1="65.5%"
            y1="38%"
            x2="76.5%"
            y2="34.8%"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          <line
            x1="76.5%"
            y1="34.8%"
            x2="87.5%"
            y2="38%"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          <line
            x1="87.5%"
            y1="38%"
            x2="82.5%"
            y2="68.2%"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />

          {/* Glowing Constellation Dot Nodes */}
          {/* Top Node */}
          <circle cx="35.5%" cy="10.5%" r="4" fill="#0284c7" />

          {/* Upper Left Nodes */}
          <circle cx="29.5%" cy="27%" r="3.5" fill="#0284c7" />
          <circle cx="51.5%" cy="30.5%" r="3.5" fill="#0284c7" />

          {/* Mid Left Nodes */}
          <circle cx="18.2%" cy="42%" r="3.5" fill="#0284c7" />
          <circle cx="23.8%" cy="56%" r="2.5" fill="#0284c7" />

          {/* Lower Left Pulsing Node */}
          <circle cx="32.2%" cy="64.2%" r="8" fill="#38bdf8" opacity="0.25" />
          <circle cx="32.2%" cy="64.2%" r="4.5" fill="#0ea5e9" />

          {/* Bottom-Left Anchor Node */}
          <circle cx="8%" cy="88%" r="4" fill="#64748b" />

          {/* Mid-Right Cyan Focus Node */}
          <circle cx="65.5%" cy="38%" r="8" fill="#38bdf8" opacity="0.3" />
          <circle cx="65.5%" cy="38%" r="4.5" fill="#0ea5e9" />

          {/* Upper-Right Nodes */}
          <circle cx="76.5%" cy="34.8%" r="3.5" fill="#0284c7" />
          <circle cx="87.5%" cy="38%" r="3.5" fill="#0284c7" />
          <circle cx="82.5%" cy="68.2%" r="3.5" fill="#0284c7" />

          {/* Ambient Stardust Dot */}
          <circle cx="70.5%" cy="82.5%" r="2" fill="#94a3b8" />

          {/* Bottom-Right Concentric Radar Rings */}
          <circle cx="81%" cy="83.5%" r="36" fill="none" stroke="#e2e8f0" strokeWidth="1.2" />
          <circle cx="81%" cy="83.5%" r="24" fill="none" stroke="#cbd5e1" strokeWidth="1.2" />
          <circle cx="81%" cy="83.5%" r="14" fill="none" stroke="#94a3b8" strokeWidth="1.2" />
          <circle cx="81%" cy="83.5%" r="6" fill="#94a3b8" opacity="0.6" />
        </svg>

        {/* TOP BRANDING: Main AxionLogo Card + AXIONHR HAVEN Text */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-md shadow-blue-500/10 border border-white/80">
            <AxionLogo className="w-7 h-7" />
          </div>
          <span className="text-base sm:text-lg font-black tracking-widest uppercase text-[#203a66]">
            AxionHR Haven
          </span>
        </div>

        {/* CENTER CONTENT: Nice to see you again / WELCOME BACK / Navy Pill Bar / Subtext */}
        <div className="relative z-10 my-auto text-center py-12 max-w-lg mx-auto">
          <p className="text-sm sm:text-base font-semibold tracking-wide text-[#334e78] mb-2">
            Nice to see you again
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-widest text-[#203a66] uppercase">
            WELCOME BACK
          </h1>

          {/* Dark Navy Horizontal Pill Bar */}
          <div className="w-14 h-1.5 bg-[#2b4c7e] rounded-full mx-auto my-4 shadow-xs" />

          <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed max-w-sm mx-auto px-2">
            From Early Signs to a Safe Haven.
          </p>
        </div>

        {/* BOTTOM FOOTER: Copyright on left + Dark Logo Chip on right */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>&copy; 2026 AxionHR</span>

          {/* Dark Circular Badge on Bottom-Right */}

        </div>
      </div>


      {/* RIGHT COLUMN: Clean White Login Account Form Panel */}
      <div className="w-full lg:w-1/2 min-h-screen bg-white flex flex-col justify-center items-center p-8 sm:p-12 lg:p-20 relative">
        <div className="w-full max-w-md">

          {/* Header Title & Subtitle */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0070f3] tracking-tight">
              Login Account
            </h2>
            <p className="text-xs text-slate-400 mt-2.5 max-w-xs mx-auto leading-relaxed">
              Welcome back to your employee wellness workspace. Sign in to access your dashboard.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email ID Field with Left Blue Accent Bar */}
            <div className="relative flex items-center rounded-sm bg-[#f8fafc] border border-slate-200/80 border-l-4 border-l-[#0070f3] focus-within:border-slate-300 focus-within:border-l-[#0070f3] focus-within:bg-white transition-all shadow-2xs">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email ID"
                className="w-full px-4 py-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                required
              />
            </div>

            {/* Password Field with Left Blue Accent Bar */}
            <div className="relative flex items-center rounded-sm bg-[#f8fafc] border border-slate-200/80 border-l-4 border-l-[#0070f3] focus-within:border-slate-300 focus-within:border-l-[#0070f3] focus-within:bg-white transition-all shadow-2xs">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3.5 pr-10 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Large Pill-Shaped Blue Button (LOG-IN) */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#0070f3] hover:bg-blue-600 active:scale-98 text-white font-extrabold tracking-widest text-xs sm:text-sm uppercase transition-all shadow-md shadow-blue-500/25 cursor-pointer"
            >
              LOG-IN
            </button>
          </form>

        </div>
      </div>

    </div>
  );
};

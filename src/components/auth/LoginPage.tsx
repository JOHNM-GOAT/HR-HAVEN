'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { AxionLogo } from '../common/AxionLogo';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, accounts, deletedAccounts } = useWellness();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline rather than a toast: the toast auto-dismisses after 4s, sits at the bottom
  // edge where the on-screen keyboard covers it, and overlaps the form on small
  // phones. An in-context message persists until the next attempt and is announced
  // by screen readers via role="alert".
  const fail = (message: string) => {
    setError(message);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      fail('Please enter your email and password to log in.');
      return;
    }

    // Check if account was deleted / archived in Recovery Vault
    const isDeleted = deletedAccounts.some(d => d.email.toLowerCase() === cleanEmail);
    if (isDeleted) {
      fail('Access Denied: This account has been deprovisioned. Please contact your Administrator to restore access.');
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
      fail('Access Denied: No registered account found for this email. An Administrator must create your account first.');
      return;
    }

    if (targetAccount.status === 'disabled') {
      fail(`Access Denied: Account for ${targetAccount.name} is currently disabled.`);
      return;
    }

    // Admin password support (accepts 'admin', 'admin123', or configured password)
    if (targetAccount.role === 'admin' || targetAccount.email.toLowerCase() === 'admin@axionhr.com') {
      const validAdminPasswords = ['admin', 'admin123', 'password123', targetAccount.password].filter(Boolean);
      if (!validAdminPasswords.includes(cleanPassword)) {
        fail('Authentication Failed: Incorrect password provided for Admin.');
        return;
      }
    } else if (targetAccount.password && cleanPassword !== targetAccount.password) {
      fail('Authentication Failed: Incorrect password provided for this account.');
      return;
    }

    // Login successfully with verified account
    login(targetAccount.role, targetAccount);
  };

  const fieldShell =
    'group flex items-center gap-2.5 rounded-2xl bg-[#f8fafc] border border-slate-200 px-3.5 transition-all ' +
    'focus-within:bg-white focus-within:border-[#0070f3] focus-within:ring-4 focus-within:ring-[#0070f3]/10';

  return (
    // dvh rather than vh: mobile browsers change viewport height as the URL bar
    // collapses, and 100vh leaves a gap / causes an unwanted scroll on iOS.
    <div className="min-h-dvh w-full flex flex-col lg:flex-row bg-white selection:bg-blue-600 selection:text-white font-sans">

      {/* ============ BRAND PANEL ============
          Mobile: a compact header band so the form stays above the fold.
          Desktop (lg+): the full-height constellation panel. */}
      <div className="relative overflow-hidden lg:w-1/2 lg:min-h-screen shrink-0
                      bg-gradient-to-br from-[#cbe2f8] via-[#e5f1fc] to-[#ffffff]
                      border-b lg:border-b-0 lg:border-r border-slate-200/80 select-none
                      px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-6
                      sm:px-10 sm:pt-8 sm:pb-8
                      lg:p-14 lg:flex lg:flex-col lg:justify-between">

        {/* Blueprint grid — tighter on mobile so it reads as texture, not big empty cells */}
        <div
          className="absolute inset-0 pointer-events-none opacity-45"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(59, 130, 246, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '28px 28px'
          }}
        />
        <div className="hidden lg:block absolute inset-0 pointer-events-none opacity-45"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(59, 130, 246, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '46px 46px'
          }}
        />

        {/* Constellation network — desktop only. Its nodes are plotted in percentages
            for a tall panel; inside a short mobile band they collapse into noise. */}
        <svg className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-0" aria-hidden="true">
          <line x1="35.5%" y1="10.5%" x2="65.5%" y2="38%" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4 3" />
          <line x1="29.5%" y1="27%" x2="51.5%" y2="30.5%" stroke="#cbd5e1" strokeWidth="1.2" />
          <line x1="29.5%" y1="27%" x2="18.2%" y2="42%" stroke="#cbd5e1" strokeWidth="1.2" />
          <line x1="18.2%" y1="42%" x2="23.8%" y2="56%" stroke="#cbd5e1" strokeWidth="1.2" />
          <line x1="23.8%" y1="56%" x2="32.2%" y2="64.2%" stroke="#cbd5e1" strokeWidth="1.2" />
          <line x1="32.2%" y1="64.2%" x2="8%" y2="88%" stroke="#94a3b8" strokeWidth="1.2" />
          <line x1="65.5%" y1="38%" x2="76.5%" y2="34.8%" stroke="#cbd5e1" strokeWidth="1.2" />
          <line x1="76.5%" y1="34.8%" x2="87.5%" y2="38%" stroke="#cbd5e1" strokeWidth="1.2" />
          <line x1="87.5%" y1="38%" x2="82.5%" y2="68.2%" stroke="#cbd5e1" strokeWidth="1.2" />

          <circle cx="35.5%" cy="10.5%" r="4" fill="#0284c7" />
          <circle cx="29.5%" cy="27%" r="3.5" fill="#0284c7" />
          <circle cx="51.5%" cy="30.5%" r="3.5" fill="#0284c7" />
          <circle cx="18.2%" cy="42%" r="3.5" fill="#0284c7" />
          <circle cx="23.8%" cy="56%" r="2.5" fill="#0284c7" />
          <circle cx="32.2%" cy="64.2%" r="8" fill="#38bdf8" opacity="0.25" />
          <circle cx="32.2%" cy="64.2%" r="4.5" fill="#0ea5e9" />
          <circle cx="8%" cy="88%" r="4" fill="#64748b" />
          <circle cx="65.5%" cy="38%" r="8" fill="#38bdf8" opacity="0.3" />
          <circle cx="65.5%" cy="38%" r="4.5" fill="#0ea5e9" />
          <circle cx="76.5%" cy="34.8%" r="3.5" fill="#0284c7" />
          <circle cx="87.5%" cy="38%" r="3.5" fill="#0284c7" />
          <circle cx="82.5%" cy="68.2%" r="3.5" fill="#0284c7" />
          <circle cx="70.5%" cy="82.5%" r="2" fill="#94a3b8" />
          <circle cx="81%" cy="83.5%" r="36" fill="none" stroke="#e2e8f0" strokeWidth="1.2" />
          <circle cx="81%" cy="83.5%" r="24" fill="none" stroke="#cbd5e1" strokeWidth="1.2" />
          <circle cx="81%" cy="83.5%" r="14" fill="none" stroke="#94a3b8" strokeWidth="1.2" />
          <circle cx="81%" cy="83.5%" r="6" fill="#94a3b8" opacity="0.6" />
        </svg>

        {/* Soft glow accent — carries the constellation feel at mobile sizes */}
        <div className="lg:hidden absolute -top-16 -right-10 w-56 h-56 rounded-full bg-sky-400/15 blur-3xl pointer-events-none" />

        {/* Branding lockup */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-2xl bg-white flex items-center justify-center shadow-md shadow-blue-500/10 border border-white/80 shrink-0">
            <AxionLogo className="w-6 h-6 lg:w-7 lg:h-7" />
          </div>
          <span className="text-sm sm:text-base lg:text-lg font-black tracking-widest uppercase text-[#203a66]">
            AxionHR Haven
          </span>
        </div>

        {/* Welcome copy — condensed on mobile, full display type on desktop */}
        {/* mt-auto/mb-auto rather than my-auto: a `lg:mt-0` alongside `lg:my-auto`
            loses to mt-* in Tailwind's emit order and only centres from the bottom. */}
        <div className="relative z-10 mt-5 lg:mt-auto lg:mb-auto lg:text-center lg:py-12 lg:max-w-lg lg:mx-auto">
          <p className="text-xs sm:text-sm lg:text-base font-semibold tracking-wide text-[#334e78] lg:mb-2">
            Nice to see you again
          </p>

          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black tracking-widest text-[#203a66] uppercase mt-0.5 lg:mt-0">
            Welcome back
          </h1>

          <div className="w-12 lg:w-14 h-1.5 bg-[#2b4c7e] rounded-full my-3 lg:mx-auto lg:my-4 shadow-xs" />

          <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed lg:max-w-sm lg:mx-auto lg:px-2">
            From Early Signs to a Safe Haven.
          </p>
        </div>

        {/* Footer — desktop only; on mobile it would push the form down for no benefit */}
        <div className="hidden lg:flex relative z-10 items-center justify-between text-xs text-slate-400 font-medium">
          <span>&copy; 2026 AxionHR</span>
        </div>
      </div>

      {/* ============ FORM PANEL ============ */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white relative
                      px-6 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]
                      sm:px-10 lg:w-1/2 lg:min-h-screen lg:p-20">
        <div className="w-full max-w-md">

          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0070f3] tracking-tight">
              Login Account
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-400 mt-2 sm:mt-2.5 max-w-xs mx-auto leading-relaxed">
              Welcome back to your employee wellness workspace. Sign in to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Email ID
              </label>
              <div className={fieldShell}>
                <Mail className="w-4 h-4 text-slate-400 shrink-0 group-focus-within:text-[#0070f3] transition-colors" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@axionhr.com"
                  // 16px on mobile: iOS Safari auto-zooms into any field under 16px.
                  className="w-full min-h-12 py-3 text-base sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-invalid={!!error}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <div className={fieldShell}>
                <Lock className="w-4 h-4 text-slate-400 shrink-0 group-focus-within:text-[#0070f3] transition-colors" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full min-h-12 py-3 text-base sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                  autoComplete="current-password"
                  aria-invalid={!!error}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  // -mr-1.5 keeps the 44px tap target from widening the field visually.
                  className="shrink-0 -mr-1.5 w-11 h-11 flex items-center justify-center rounded-xl text-slate-400
                             hover:text-slate-600 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Inline error */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 px-3.5 py-3 rounded-2xl bg-rose-50 border border-rose-200 animate-in fade-in duration-200"
              >
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-rose-700 leading-snug">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full min-h-13 py-4 rounded-full bg-[#0070f3] hover:bg-blue-600 active:scale-[0.98]
                         text-white font-extrabold tracking-widest text-sm uppercase transition-all
                         shadow-md shadow-blue-500/25 cursor-pointer
                         focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0070f3]/30"
            >
              Log-in
            </button>
          </form>

          {/* Mobile-only copyright, since the brand panel drops its footer on small screens */}
          <p className="lg:hidden text-center text-[11px] text-slate-300 font-medium mt-8">
            &copy; 2026 AxionHR
          </p>
        </div>
      </div>
    </div>
  );
};

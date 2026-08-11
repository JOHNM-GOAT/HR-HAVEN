'use client';

import React from 'react';
import { useWellness } from '../../context/WellnessContext';
import { getBurnoutRiskConfig } from '../../types/wellness';
import { 
  ShieldAlert, 
  Moon, 
  HeartHandshake,
  Zap,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    userRole, 
    burnoutMetrics, 
    accessibility, 
    toggleFocusMode,
    boundaryConfig,
    toggleBoundaryShield,
    setActiveTab,
    isSidebarOpen,
    toggleSidebar,
    logout
  } = useWellness();

  const riskConfig = getBurnoutRiskConfig(burnoutMetrics.riskLevel);

  return (
    <header className="sticky top-0 z-50 shrink-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 lg:px-6 py-3 flex items-center justify-between shadow-xs">
      {/* Brand & Logo Mobile indicator */}
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Button */}
        <button
          onClick={() => toggleSidebar()}
          className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-95 flex items-center justify-center"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          {isSidebarOpen ? <X className="w-5 h-5 text-blue-600" /> : <Menu className="w-5 h-5 text-slate-700" />}
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 md:hidden">
            <HeartHandshake className="w-5 h-5 text-white" />
          </div>
          <div className="md:hidden">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Axion<span className="text-blue-600">HR</span> Haven
            </h1>
          </div>
          <div className="hidden md:block">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              {userRole === 'hr_manager' ? 'HR Executive Portal' : 'Dashboard Overview'}
            </h2>
            <p className="text-xs text-slate-500">AxionHR AI Well-Being & Burnout Prevention</p>
          </div>
        </div>
      </div>

      {/* Center Actions / Status Pill (Employee View Only) */}
      {userRole !== 'hr_manager' && (
        <div className="hidden md:flex items-center gap-3">
          {/* Burnout Risk Badge */}
          <div 
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${riskConfig.badgeBg} hover:brightness-95`}
          >
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>Burnout Risk Index: <strong className="font-bold">{burnoutMetrics.overallScore}/100</strong> ({riskConfig.label.toUpperCase()})</span>
          </div>

          {/* Boundary Guard Status */}
          <button
            onClick={toggleBoundaryShield}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              boundaryConfig.activeShield
                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
            title="Work-Life Boundary Guard"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Boundary Guard: {boundaryConfig.activeShield ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Adaptive Focus Mode Quick Toggle (Employee View Only) */}
        {userRole !== 'hr_manager' && (
          <button
            onClick={toggleFocusMode}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              accessibility.focusModeActive
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Focus Mode</span>
          </button>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

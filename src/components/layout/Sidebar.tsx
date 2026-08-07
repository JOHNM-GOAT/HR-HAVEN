'use client';

import React from 'react';
import { useWellness, NavTab } from '../../context/WellnessContext';
import { 
  LayoutDashboard, 
  Activity, 
  Heart, 
  BrainCircuit, 
  Award, 
  Sliders, 
  ShieldCheck, 
  Users,
  HeartHandshake,
  LogOut
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, userRole, logout } = useWellness();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'analytics', label: 'AI Burnout Predictor', icon: <Activity className="w-4 h-4" />, badge: 'AI' },
    { id: 'physical', label: 'Physical Health', icon: <Heart className="w-4 h-4" /> },
    { id: 'mental', label: 'Mental & AI Coach', icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 'social', label: 'Appreciations', icon: <Award className="w-4 h-4" /> },
    { id: 'inclusive', label: 'Adaptive Focus Mode', icon: <Sliders className="w-4 h-4" /> },
    { id: 'boundary', label: 'Boundary Guard', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  if (userRole === 'hr_manager') {
    navItems.push({ id: 'hr', label: 'HR Executive View', icon: <Users className="w-4 h-4" />, badge: 'Admin' });
  }

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col bg-[#0b192e] text-slate-300 min-h-[calc(100vh-61px)] p-4 justify-between border-r border-slate-800">
      <div className="space-y-6">
        {/* Brand Logo Header inside Sidebar */}
        <div className="flex items-center gap-3 px-2 py-1 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <HeartHandshake className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight leading-none">
              Axion<span className="text-blue-400">HR</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Safe Haven Platform</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main Menu
          </p>
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badge === 'AI' 
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                      : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom User Quick Card */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            alt="User Avatar"
            className="w-8 h-8 rounded-full border border-blue-400 object-cover"
          />
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">
              {userRole === 'hr_manager' ? 'HR Director' : 'Alex Mercer'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {userRole === 'hr_manager' ? 'hr.director@axionhr.com' : 'johnmicooh.ugot@axionhr.com'}
            </p>
          </div>
        </div>

        <button 
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <LogOut className="w-4 h-4 text-slate-500" />
          <span>Disconnect / Logout</span>
        </button>
      </div>
    </aside>
  );
};

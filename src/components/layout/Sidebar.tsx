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
  LogOut,
  X
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    userRole, 
    logout, 
    isSidebarOpen, 
    toggleSidebar 
  } = useWellness();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = 
    userRole === 'hr_manager' 
      ? [
          { id: 'hr', label: 'HR Executive View', icon: <Users className="w-4 h-4" />, badge: 'Admin' }
        ]
      : [
          { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'analytics', label: 'AI Burnout Predictor', icon: <Activity className="w-4 h-4" />, badge: 'AI' },
          { id: 'physical', label: 'Physical Health', icon: <Heart className="w-4 h-4" /> },
          { id: 'mental', label: 'Mental & AI Coach', icon: <BrainCircuit className="w-4 h-4" /> },
          { id: 'social', label: 'Appreciations', icon: <Award className="w-4 h-4" /> },
          { id: 'inclusive', label: 'Adaptive Focus Mode', icon: <Sliders className="w-4 h-4" /> },
          { id: 'boundary', label: 'Boundary Guard', icon: <ShieldCheck className="w-4 h-4" /> },
        ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => toggleSidebar(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Component */}
      <aside 
        className={`
          shrink-0 flex flex-col bg-gradient-to-b from-[#e0f2fe]/90 via-[#f0f9ff]/80 to-[#ffffff]/90 text-slate-800 backdrop-blur-md font-sans transition-all duration-300 z-50
          fixed inset-y-0 left-0 h-full shadow-2xl md:shadow-none md:relative md:h-auto md:min-h-[calc(100vh-61px)]
          ${isSidebarOpen 
            ? 'w-64 p-4 border-r border-slate-200/80 translate-x-0 opacity-100' 
            : 'w-0 -translate-x-full p-0 opacity-0 overflow-hidden border-none pointer-events-none'
          }
        `}
      >
        <div className="flex-1 space-y-6">
          {/* Brand Logo Header inside Sidebar */}
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab(userRole === 'hr_manager' ? 'hr' : 'dashboard')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-extrabold text-lg">
                <HeartHandshake className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
                  Axion<span className="text-blue-600">HR</span>
                </h1>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Safe Haven Platform</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => toggleSidebar(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="space-y-1.5">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {userRole === 'hr_manager' ? 'HR Management Portal' : 'Overview'}
            </p>
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-blue-600 font-extrabold shadow-sm border border-slate-200/80'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-blue-600' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 text-white'
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
        <div className="mt-auto pt-3 border-t border-slate-200/80 space-y-2">
          <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/80 flex items-center gap-2.5">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
              alt="User Avatar"
              className="w-7 h-7 rounded-full border border-blue-500 object-cover"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">
                {userRole === 'hr_manager' ? 'HR Director' : 'Alex Mercer'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {userRole === 'hr_manager' ? 'hr.director@axionhr.com' : 'johnmicooh.ugot@axionhr.com'}
              </p>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

'use client';

import React from 'react';
import { useWellness, NavTab } from '../../context/WellnessContext';
import { AxionLogo } from '../common/AxionLogo';
import {
  LayoutDashboard,
  Activity,
  Heart,
  BrainCircuit,
  Award,
  Sliders,
  ShieldCheck,
  Users,
  UserCog,
  LogOut,
  Palmtree,
  Moon
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    userRole,
    logout,
    isSidebarOpen,
    toggleSidebar,
    userProfile,
    isDarkMode,
    unreadHrNotificationCount,
    boundaryConfig,
    toggleBoundaryShield
  } = useWellness();

  const hrBadge = unreadHrNotificationCount > 0 ? `${unreadHrNotificationCount} Alerts` : 'HR';

  const navSections: { title?: string; items: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] }[] = 
    userRole === 'admin'
      ? [
          {
            title: 'System Administration',
            items: [
              { id: 'accounts', label: 'Account Management', icon: <UserCog className="w-5 h-5" />, badge: 'Admin' },
              { id: 'hr', label: 'HR Executive View', icon: <Users className="w-5 h-5" />, badge: hrBadge },
              { id: 'pto', label: 'PTO & Time-Off Hub', icon: <Palmtree className="w-5 h-5" /> }
            ]
          }
        ]
      : userRole === 'hr_manager' 
      ? [
          {
            title: 'HR Management Portal',
            items: [
              { id: 'hr', label: 'HR Executive View', icon: <Users className="w-5 h-5" />, badge: hrBadge },
              { id: 'pto', label: 'PTO & Time-Off Hub', icon: <Palmtree className="w-5 h-5" /> }
            ]
          }
        ]
      : [
          {
            title: 'Overview',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> }
            ]
          },
          {
            title: 'Six Wellness Pillars',
            items: [
              { id: 'analytics', label: 'AI Burnout Predictor', icon: <Activity className="w-5 h-5" />, badge: 'AI' },
              { id: 'physical', label: 'Physical Health', icon: <Heart className="w-5 h-5" /> },
              { id: 'mental', label: 'Mental & AI Coach', icon: <BrainCircuit className="w-5 h-5" /> },
              { id: 'social', label: 'Appreciations', icon: <Award className="w-5 h-5" /> },
              { id: 'inclusive', label: 'Adaptive Focus Mode', icon: <Sliders className="w-5 h-5" /> },
              { id: 'boundary', label: 'Boundary Guard', icon: <ShieldCheck className="w-5 h-5" /> }
            ]
          },
          {
            title: 'Time-Off & Leave',
            items: [
              { 
                id: 'pto', 
                label: 'PTO & Rest Hub', 
                icon: <Palmtree className="w-5 h-5" />
              }
            ]
          }
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

      {/* Mini Sidebar / Full Sidebar Component */}
      <aside 
        className={`
          shrink-0 flex flex-col font-sans transition-all duration-300 z-50
          fixed inset-y-0 left-0 h-full shadow-2xl md:shadow-none md:relative md:h-screen
          ${isDarkMode 
            ? 'bg-[#18191f] text-slate-100 border-r border-[#2a2d38]' 
            : 'bg-gradient-to-b from-[#e0f2fe]/90 via-[#f0f9ff]/80 to-[#ffffff]/90 text-slate-800 border-r border-slate-200/80'
          }
          backdrop-blur-md
          ${isSidebarOpen 
            ? 'w-64 p-3.5 translate-x-0' 
            : '-translate-x-full md:translate-x-0 md:w-[76px] p-2.5'
          }
        `}
      >
        <div className="flex-1 space-y-3 overflow-y-auto pr-0.5 custom-scrollbar">
          {/* Brand Logo Header (Acts as Sidebar Expander & Minimizer) */}
          {isSidebarOpen ? (
            /* Full-Width Header */
            <button 
              className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-2xl transition-all cursor-pointer group text-left ${
                isDarkMode ? 'hover:bg-[#252833]' : 'hover:bg-white/60'
              }`}
              onClick={() => toggleSidebar(false)}
              title="Click to minimize sidebar"
              aria-label="Click to minimize sidebar"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md border group-hover:scale-105 transition-all shrink-0 ${
                isDarkMode ? 'bg-[#20222a] border-[#2e323e] shadow-black/40' : 'bg-white border-slate-200/60 shadow-blue-500/10'
              }`}>
                <AxionLogo className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className={`text-base font-extrabold tracking-tight leading-none group-hover:text-blue-500 transition-colors truncate ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Axion<span className="text-blue-600">HR</span>
                </h1>
                <p className={`text-[11px] font-semibold mt-0.5 truncate ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>Safe Haven Platform</p>
              </div>
            </button>
          ) : (
            /* Mini Sidenav Header */
            <button
              className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center shadow-md border hover:scale-105 transition-all cursor-pointer group relative ${
                isDarkMode ? 'bg-[#20222a] border-[#2e323e] shadow-black/40' : 'bg-white border-slate-200/60 shadow-blue-500/10'
              }`}
              onClick={() => toggleSidebar(true)}
              title="Click to expand sidebar"
              aria-label="Click to expand sidebar"
            >
              <AxionLogo className="w-7 h-7" />
              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                AxionHR Haven (Click to Expand)
              </div>
            </button>
          )}

          {/* Section Divider */}
          <div className={`h-px mx-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200/80'}`} />

          {/* Navigation Sections */}
          <div className="space-y-3">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {sIdx > 0 && (
                  <div className={`h-px my-2 mx-1.5 ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-200/60'}`} />
                )}
                {isSidebarOpen && section.title && (
                  <p className={`px-3 text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                    isDarkMode ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {section.title}
                  </p>
                )}

                {section.items.map(item => {
                  const isActive = activeTab === item.id;
                  
                  if (!isSidebarOpen) {
                    /* Mini Sidenav Icon-Only Button */
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-11 h-11 mx-auto rounded-xl flex items-center justify-center relative group transition-all cursor-pointer ${
                          isActive
                            ? isDarkMode ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-blue-600 shadow-sm border border-slate-200/90'
                            : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/70' : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                      >
                        <span className={isActive ? (isDarkMode ? 'text-white' : 'text-blue-600') : (isDarkMode ? 'text-slate-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-800')}>
                          {item.icon}
                        </span>

                        {/* Active Indicator Dot */}
                        {isActive && (
                          <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${isDarkMode ? 'bg-white' : 'bg-blue-600'}`} />
                        )}

                        {/* Badge Dot for Alerts in Mini Mode */}
                        {item.badge && !isActive && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-900" />
                        )}

                        {/* Hover Floating Tooltip */}
                        <div className="absolute left-full ml-3.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 flex items-center gap-1.5">
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-bold">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  }

                  /* Full-Width Nav Button */
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-normal transition-all cursor-pointer ${
                        isActive
                          ? isDarkMode ? 'bg-blue-600 text-white font-medium shadow-md' : 'bg-white text-blue-600 font-medium shadow-xs border border-slate-200/80'
                          : isDarkMode ? 'text-[#d1d5db] hover:text-white hover:bg-[#252833]' : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive ? (isDarkMode ? 'text-white' : 'text-blue-600') : (isDarkMode ? 'text-slate-400' : 'text-slate-400')}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          isActive
                            ? isDarkMode ? 'bg-white text-blue-900 font-bold' : 'bg-blue-600 text-white'
                            : isDarkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-white'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom User Quick Card */}
        <div className={`mt-auto pt-3 border-t space-y-2 ${isDarkMode ? 'border-[#2a2d38]' : 'border-slate-200/80'}`}>
          {isSidebarOpen ? (
            /* Full-Width User Card */
            <>
              {userRole === 'employee' && (
                <button
                  onClick={toggleBoundaryShield}
                  className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    boundaryConfig.activeShield
                      ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300'
                      : isDarkMode
                        ? 'bg-[#20222a] border-[#2e323e] text-slate-400 hover:bg-[#282b36]'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Work-Life Boundary Guard"
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Boundary Guard: {boundaryConfig.activeShield ? 'ON' : 'OFF'}</span>
                </button>
              )}

              <div
                onClick={() => setActiveTab('settings')}
                className={`p-2.5 rounded-xl border transition-all flex items-center gap-2.5 cursor-pointer group shadow-2xs ${
                  isDarkMode 
                    ? 'bg-[#20222a] hover:bg-[#282b36] border-[#2e323e] hover:border-blue-500' 
                    : 'bg-white/80 hover:bg-white border-slate-200/80 hover:border-blue-300'
                }`}
                title="Open Settings & Profile"
              >
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-8 h-8 rounded-full border border-blue-500 object-cover shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 overflow-hidden">
                  <p className={`text-sm font-medium group-hover:text-blue-400 transition-colors truncate ${
                    isDarkMode ? 'text-slate-100' : 'text-slate-800'
                  }`}>
                    {userProfile.name}
                  </p>
                  <p className={`text-xs font-normal truncate ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {userProfile.email}
                  </p>
                </div>
              </div>

              <button 
                onClick={logout}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[15px] font-normal transition-colors cursor-pointer ${
                  isDarkMode ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/30' : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                }`}
              >
                <LogOut className="w-4.5 h-4.5 text-slate-400" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            /* Mini Sidenav User & Logout */
            <div className="flex flex-col items-center gap-2">
              <div 
                onClick={() => setActiveTab('settings')}
                className="relative group cursor-pointer"
                title="Settings & Profile"
              >
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-9 h-9 rounded-full border-2 border-blue-500 object-cover shadow-sm group-hover:scale-105 transition-transform"
                />
                {/* Tooltip */}
                <div className="absolute left-full ml-3.5 bottom-0 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  <p className="font-semibold text-white">
                    {userProfile.name} (Settings)
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {userProfile.email}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-11 h-11 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer relative group"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-600" />
                {/* Tooltip */}
                <div className="absolute left-full ml-3.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  Logout
                </div>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

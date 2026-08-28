// 'use client';

// import React from 'react';
// import { useWellness } from '../../context/WellnessContext';
// import { getBurnoutRiskConfig } from '../../types/wellness';
// import { AxionLogo } from '../common/AxionLogo';
// import { 
//   ShieldAlert, 
//   Moon, 
//   Zap,
//   LogOut,
//   Menu,
//   X
// } from 'lucide-react';

// export const Navbar: React.FC = () => {
//   const { 
//     userRole, 
//     burnoutMetrics, 
//     accessibility, 
//     toggleFocusMode,
//     boundaryConfig,
//     toggleBoundaryShield,
//     setActiveTab,
//     isSidebarOpen,
//     toggleSidebar,
//     logout
//   } = useWellness();

//   const riskConfig = getBurnoutRiskConfig(burnoutMetrics.riskLevel);

//   return (
//     <header className="sticky top-0 z-50 shrink-0 w-full bg-white/95 backdrop-blur-md px-4 lg:px-6 py-3 flex items-center justify-between shadow-xs">
//       {/* Integrated AxionHR Brand Logo & Hamburger Menu Button */}
//       <button
//         onClick={() => toggleSidebar()}
//         className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 hover:bg-blue-50/80 hover:border-blue-200/90 transition-all active:scale-[0.98] group cursor-pointer shadow-2xs"
//         title={isSidebarOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
//         aria-label="Toggle Navigation Menu"
//       >
//         <div className="p-1 rounded-lg text-slate-600 group-hover:text-blue-600 transition-colors">
//           {isSidebarOpen ? <X className="w-5 h-5 text-blue-600" /> : <Menu className="w-5 h-5" />}
//         </div>
//         <div className="h-5 w-px bg-slate-200/80" />
//         <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-200/60 group-hover:scale-105 transition-all">
//           <AxionLogo className="w-6 h-6" />
//         </div>
//         <div className="text-left">
//           <div className="flex items-center gap-1.5">
//             <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
//               Axion<span className="text-blue-600">HR</span>
//             </h1>
//             <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100/80 leading-none">
//               Haven
//             </span>
//           </div>
//           <p className="text-[10px] font-semibold text-slate-400 mt-0.5 group-hover:text-slate-600 transition-colors leading-none">
//             {userRole === 'admin' ? 'System Admin Portal' : userRole === 'hr_manager' ? 'HR Executive Portal' : 'AI Well-Being Platform'}
//           </p>
//         </div>
//       </button>

//       {/* Center Actions / Status Pill (Employee View Only) */}
//       {userRole === 'employee' && (
//         <div className="hidden md:flex items-center gap-3">
//           {/* Burnout Risk Badge */}
//           <div 
//             onClick={() => setActiveTab('analytics')}
//             className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${riskConfig.badgeBg} hover:brightness-95`}
//           >
//             <ShieldAlert className="w-4 h-4 animate-pulse" />
//             <span>Burnout Risk Index: <strong className="font-bold">{burnoutMetrics.overallScore}/100</strong> ({riskConfig.label.toUpperCase()})</span>
//           </div>

//           {/* Boundary Guard Status */}
//           <button
//             onClick={toggleBoundaryShield}
//             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
//               boundaryConfig.activeShield
//                 ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
//                 : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
//             }`}
//             title="Work-Life Boundary Guard"
//           >
//             <Moon className="w-3.5 h-3.5" />
//             <span>Boundary Guard: {boundaryConfig.activeShield ? 'ON' : 'OFF'}</span>
//           </button>
//         </div>
//       )}

//       {/* Right Controls */}
//       <div className="flex items-center gap-2 sm:gap-4">
//         {/* Adaptive Focus Mode Quick Toggle (Employee View Only) */}
//         {userRole === 'employee' && (
//           <button
//             onClick={toggleFocusMode}
//             className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
//               accessibility.focusModeActive
//                 ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
//                 : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
//             }`}
//           >
//             <Zap className="w-3.5 h-3.5" />
//             <span className="hidden sm:inline">Focus Mode</span>
//           </button>
//         )}

//         {/* Logout Button */}
//         <button
//           onClick={logout}
//           className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
//           title="Logout"
//         >
//           <LogOut className="w-4 h-4" />
//           <span className="hidden sm:inline">Logout</span>
//         </button>
//       </div>
//     </header>
//   );
// };

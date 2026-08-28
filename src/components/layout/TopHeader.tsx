// 'use client';

// import React from 'react';
// import { useWellness } from '../../context/WellnessContext';
// import { Sun, Moon, Sparkles, Shield, User, ChevronDown } from 'lucide-react';

// export const TopHeader: React.FC = () => {
//   const { userProfile, theme, setTheme, isDarkMode, setActiveTab } = useWellness();

//   const toggleThemeMode = () => {
//     setTheme(isDarkMode ? 'light' : 'dark');
//   };

//   return (
//     <header
//       className={`px-4 sm:px-6 py-3 border-b transition-colors flex items-center justify-between gap-4 select-none ${
//         isDarkMode
//           ? 'bg-[#18191f]/90 border-[#2a2d38] text-slate-100'
//           : 'bg-white/90 border-slate-200/80 text-slate-900'
//       } backdrop-blur-md sticky top-0 z-30`}
//     >
//       {/* Left: Portal Branding & Context */}
//       <div className="flex items-center gap-3">
//         <div className="flex items-center gap-2">
//           <span className="font-extrabold text-sm sm:text-base tracking-tight">
//             Axion<span className="text-blue-600">HR</span> Portal
//           </span>
//           <span
//             className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
//               isDarkMode
//                 ? 'bg-[#0f3d20] text-[#dcfce7] border-[#166534]'
//                 : 'bg-emerald-50 text-emerald-700 border-emerald-200'
//             }`}
//           >
//             <Sparkles className="w-3 h-3" /> Safe Haven Active
//           </span>
//         </div>
//       </div>

//       {/* Right: Theme Toggle Switch & User Profile Dropdown */}
//       <div className="flex items-center gap-3 sm:gap-5">
//         {/* Light / Dark Mode Switcher (Matching Example Pill Switch) */}
//         <div
//           onClick={toggleThemeMode}
//           className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all active:scale-95 ${
//             isDarkMode
//               ? 'bg-[#20222a] border-[#2e323e] hover:border-blue-500 text-slate-200'
//               : 'bg-slate-50 border-slate-200 hover:border-blue-400 text-slate-700'
//           }`}
//           role="button"
//           aria-label="Toggle Theme Mode"
//           title={`Switch to ${isDarkMode ? 'Light Mode' : 'Dark Mode'}`}
//         >
//           {/* Toggle pill track & thumb */}
//           <div
//             className={`w-9 h-5 rounded-full flex items-center p-0.5 transition-colors ${
//               isDarkMode ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
//             }`}
//           >
//             <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
//           </div>

//           {/* Toggle Label with Icon */}
//           <span className="text-xs font-bold flex items-center gap-1 tracking-wide">
//             {isDarkMode ? (
//               <>
//                 <Moon className="w-3.5 h-3.5 text-blue-400" />
//                 <span className="hidden xs:inline">DARK MODE</span>
//               </>
//             ) : (
//               <>
//                 <Sun className="w-3.5 h-3.5 text-amber-500" />
//                 <span className="hidden xs:inline text-amber-700">LIGHT MODE</span>
//               </>
//             )}
//           </span>
//         </div>

//         {/* User Profile Summary */}
//         <div
//           onClick={() => setActiveTab('settings')}
//           className={`flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-full border cursor-pointer transition-all ${
//             isDarkMode
//               ? 'bg-[#20222a] border-[#2e323e] hover:border-blue-500'
//               : 'bg-slate-50 border-slate-200 hover:border-blue-300'
//           }`}
//           title="View Profile & Settings"
//         >
//           <img
//             src={userProfile.avatarUrl}
//             alt={userProfile.name}
//             className="w-7 h-7 rounded-full border border-blue-500 object-cover shrink-0"
//           />
//           <span className="text-xs font-bold text-slate-200 hidden sm:inline max-w-[120px] truncate">
//             {userProfile.name}
//           </span>
//           <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
//         </div>
//       </div>
//     </header>
//   );
// };

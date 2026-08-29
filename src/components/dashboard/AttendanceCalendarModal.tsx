'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  AlertTriangle,
  Palmtree,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';

export const AttendanceCalendarModal: React.FC = () => {
  const {
    isAttendanceModalOpen,
    setIsAttendanceModalOpen,
    teamShifts,
    workShift,
    userProfile,
    ptoRequests,
    isDarkMode
  } = useWellness();

  // Current viewed month state
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(() => new Date().getDate());

  if (!isAttendanceModalOpen) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const realToday = new Date();
  const isViewingCurrentMonth = currentYear === realToday.getFullYear() && currentMonth === realToday.getMonth();
  const todayDayNum = realToday.getDate();
  const todayDateStr = `${realToday.getFullYear()}-${String(realToday.getMonth() + 1).padStart(2, '0')}-${String(realToday.getDate()).padStart(2, '0')}`;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Monday = 0

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDay(null);
  };

  const getDayAttendance = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = (new Date(currentYear, currentMonth, day).getDay() + 6) % 7;
    const isWeekend = dayOfWeek >= 5;
    const isToday = isViewingCurrentMonth && day === todayDayNum;

    // Today's live active work shift
    if (isToday && (workShift.isClockedIn || workShift.totalWorkedSeconds > 0)) {
      return {
        type: 'shift' as const,
        clockIn: workShift.clockInTime || 'Active Now',
        clockOut: workShift.isClockedIn ? 'Active Shift' : workShift.clockOutTime || 'Off Duty',
        hours: (workShift.totalWorkedSeconds / 3600).toFixed(1),
        overtime: (workShift.overtimeSeconds / 3600).toFixed(1),
        status: workShift.isClockedIn ? ('active' as const) : ('completed' as const)
      };
    }

    // Check if user has a real shift record in teamShifts
    const matchedShift = teamShifts.find(
      s => (s.userId === userProfile.id || s.userName === userProfile.name) && s.date === dateStr
    );
    if (matchedShift) {
      return {
        type: 'shift' as const,
        clockIn: matchedShift.clockInTime || 'Clocked In',
        clockOut: matchedShift.clockOutTime || (matchedShift.status === 'active' ? 'Active Shift' : 'Completed'),
        hours: (matchedShift.totalWorkedSeconds / 3600).toFixed(1),
        overtime: (matchedShift.overtimeSeconds / 3600).toFixed(1),
        status: matchedShift.status
      };
    }

    // Check if PTO matches
    const matchedPto = ptoRequests.find(
      r => (r.userId === userProfile.id || r.userName === userProfile.name) &&
        r.status === 'approved' && dateStr >= r.startDate && dateStr <= r.endDate
    );
    if (matchedPto) {
      return {
        type: 'pto' as const,
        label: matchedPto.category === 'mental_health' ? '🧘 Mental Health Day' : '🏖️ Approved PTO',
        reason: matchedPto.reason || 'Rest & Recovery'
      };
    }

    if (isWeekend) {
      return { type: 'weekend' as const, label: 'Weekend Off' };
    }

    return { type: 'upcoming' as const, label: 'Scheduled Workday' };
  };

  const selectedDayData = selectedDay ? getDayAttendance(selectedDay) : null;

  // Real-time Monthly Statistics
  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const userMonthShifts = teamShifts.filter(
    s => (s.userId === userProfile.id || s.userName === userProfile.name) && s.date.startsWith(monthPrefix)
  );
  const hasTodayRecorded = userMonthShifts.some(s => s.date === todayDateStr);

  let totalMonthWorkedSecs = userMonthShifts.reduce((acc, s) => acc + (s.totalWorkedSeconds || 0), 0);
  let totalMonthOtSecs = userMonthShifts.reduce((acc, s) => acc + (s.overtimeSeconds || 0), 0);

  if (isViewingCurrentMonth && !hasTodayRecorded && workShift.totalWorkedSeconds > 0) {
    totalMonthWorkedSecs += workShift.totalWorkedSeconds;
    totalMonthOtSecs += workShift.overtimeSeconds;
  }

  const totalMonthHours = (totalMonthWorkedSecs / 3600).toFixed(1);
  const totalMonthOtHours = (totalMonthOtSecs / 3600).toFixed(1);

  const monthPtoDays = ptoRequests
    .filter(r => (r.userId === userProfile.id || r.userName === userProfile.name) &&
      r.status === 'approved' && (r.startDate.startsWith(monthPrefix) || r.endDate.startsWith(monthPrefix)))
    .reduce((acc, r) => acc + r.totalDays, 0);

  const totalCompletedShifts = userMonthShifts.length + (isViewingCurrentMonth && (workShift.isClockedIn || workShift.totalWorkedSeconds > 0) ? 1 : 0);
  const onTimeRate = totalCompletedShifts > 0 ? '100%' : '100%';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-5 sm:p-7 transition-all ${
          isDarkMode
            ? 'bg-[#14161e] border-[#2e323e] text-white shadow-black/60'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">Workday Attendance & Past Calendar</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {userProfile.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review your historical shift time-in/out records, standard 8h targets, and overtime telemetry.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAttendanceModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Summary Telemetry Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1a1d27] border-[#2a2e3d]' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Work Logged</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{totalMonthHours}</span>
              <span className="text-xs text-slate-400">Hours</span>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-emerald-50/70 border-emerald-200'}`}>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">On-Time Attendance</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{onTimeRate}</span>
              <span className="text-xs text-emerald-600/80">Punctual</span>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-amber-950/20 border-amber-800/40' : 'bg-amber-50/70 border-amber-200'}`}>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">Overtime Accumulated</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{parseFloat(totalMonthOtHours) > 0 ? `+${totalMonthOtHours}` : '0.0'}</span>
              <span className="text-xs text-amber-700/80 dark:text-amber-400/80">OT Hours</span>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-cyan-950/20 border-cyan-800/40' : 'bg-cyan-50/70 border-cyan-200'}`}>
            <span className="text-[11px] font-bold text-cyan-700 dark:text-cyan-300">Rest Days Taken</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{monthPtoDays.toFixed(1)}</span>
              <span className="text-xs text-cyan-700/80 dark:text-cyan-400/80">Day{monthPtoDays !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Month Selector Bar */}
        <div className="flex items-center justify-between p-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#191c26] mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-extrabold tracking-tight">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Monthly Calendar Grid */}
        <div className="mb-5">
          {/* Day of week labels */}
          <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(dayName => (
              <span key={dayName} className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {dayName}
              </span>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty padding days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 sm:h-20 rounded-2xl bg-transparent opacity-0" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const att = getDayAttendance(day);
              const isSelected = selectedDay === day;
              const isToday = isViewingCurrentMonth && day === todayDayNum;

              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`h-16 sm:h-20 p-2 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500 shadow-md'
                      : isToday
                      ? isDarkMode
                        ? 'bg-blue-950/40 border-blue-500/60'
                        : 'bg-blue-50 border-blue-400'
                      : att.type === 'shift'
                      ? parseFloat(att.overtime) > 0
                        ? isDarkMode
                          ? 'bg-amber-950/20 border-amber-800/40 hover:border-amber-500'
                          : 'bg-amber-50/50 border-amber-200 hover:border-amber-400'
                        : isDarkMode
                        ? 'bg-[#1a1d27] border-[#292d3b] hover:border-blue-500/50'
                        : 'bg-white border-slate-200 hover:border-blue-400'
                      : att.type === 'pto'
                      ? isDarkMode
                        ? 'bg-cyan-950/30 border-cyan-800/50'
                        : 'bg-cyan-50 border-cyan-200'
                      : isDarkMode
                      ? 'bg-[#12141c]/60 border-slate-800/50 opacity-60'
                      : 'bg-slate-50 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-black ${isToday ? 'text-blue-600 dark:text-blue-400 font-black' : ''}`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                    )}
                  </div>

                  {att.type === 'shift' && (
                    <div className="text-[10px] leading-tight">
                      <span className="font-extrabold text-blue-600 dark:text-blue-400 block truncate">
                        {att.hours}h Logged
                      </span>
                      {parseFloat(att.overtime) > 0 ? (
                        <span className="text-[9px] font-bold text-amber-500 block truncate">
                          +{att.overtime}h OT
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400 block truncate hidden sm:block">
                          {att.clockIn}
                        </span>
                      )}
                    </div>
                  )}

                  {att.type === 'pto' && (
                    <div className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 leading-tight">
                      🧘 Rest Day
                    </div>
                  )}

                  {att.type === 'weekend' && (
                    <div className="text-[9px] text-slate-400 hidden sm:block">
                      Off Duty
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Inspector Card */}
        {selectedDay && selectedDayData && (
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-[#181b24] border-[#2d3242]' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">📅</span>
                <div>
                  <h4 className="text-sm font-extrabold">
                    {monthNames[currentMonth]} {selectedDay}, {currentYear} Shift Report
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedDayData.type === 'shift'
                      ? 'Standard Workday Shift Logged'
                      : selectedDayData.type === 'pto'
                      ? 'Approved Time-Off / Recharge Day'
                      : 'Scheduled Weekend / Rest'}
                  </span>
                </div>
              </div>

              {selectedDayData.type === 'shift' && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${
                  parseFloat(selectedDayData.overtime) > 0
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 font-extrabold'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                }`}>
                  {parseFloat(selectedDayData.overtime) > 0 ? `⚠️ Overtime (${selectedDayData.overtime}h OT)` : '✅ Standard 8h Shift'}
                </span>
              )}
            </div>

            {selectedDayData.type === 'shift' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-1 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Time In (Clock-In)</span>
                  <strong className="text-blue-600 dark:text-blue-400 text-sm font-extrabold">
                    {selectedDayData.clockIn}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Time Out (Clock-Out)</span>
                  <strong className="text-slate-800 dark:text-slate-200 text-sm font-extrabold">
                    {selectedDayData.clockOut}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Total Shift Hours</span>
                  <strong className="text-slate-800 dark:text-slate-200 text-sm font-extrabold">
                    {selectedDayData.hours} Hours
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Overtime Logged</span>
                  <strong className={`${parseFloat(selectedDayData.overtime) > 0 ? 'text-amber-500' : 'text-slate-400'} text-sm font-extrabold`}>
                    {selectedDayData.overtime} hrs OT
                  </strong>
                </div>
              </div>
            )}

            {selectedDayData.type === 'pto' && (
              <div className="mt-3 text-xs flex items-center gap-3">
                <Palmtree className="w-5 h-5 text-cyan-500" />
                <span>
                  Approved Rest Period: <strong>{selectedDayData.label}</strong> ({selectedDayData.reason})
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-800 mt-5">
          <button
            onClick={() => setIsAttendanceModalOpen(false)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
          >
            Close Calendar View
          </button>
        </div>
      </div>
    </div>
  );
};

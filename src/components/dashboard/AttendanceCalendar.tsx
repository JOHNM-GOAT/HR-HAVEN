'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { Tooltip } from '../common/Tooltip';
import { getLateMinutes, formatLateDuration } from '../../types/wellness';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Palmtree
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const AttendanceCalendar: React.FC<{ variant: 'inline' | 'modal' }> = ({ variant }) => {
  const {
    isAttendanceModalOpen,
    setIsAttendanceModalOpen,
    teamShifts,
    workShift,
    userProfile,
    ptoRequests,
    isDarkMode
  } = useWellness();

  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [month, setMonth] = useState<number>(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(() => new Date().getDate());

  if (variant === 'modal' && !isAttendanceModalOpen) return null;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(prev => prev - 1);
    } else {
      setMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(prev => prev + 1);
    } else {
      setMonth(prev => prev + 1);
    }
  };

  const realToday = new Date();
  const isCurrentViewingMonth = year === realToday.getFullYear() && month === realToday.getMonth();
  const todayDayNum = realToday.getDate();
  const todayDateStr = `${realToday.getFullYear()}-${String(realToday.getMonth() + 1).padStart(2, '0')}-${String(realToday.getDate()).padStart(2, '0')}`;

  const getDayShiftInfo = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = (new Date(year, month, day).getDay() + 6) % 7;
    const isWeekend = dayOfWeek >= 5;
    const isToday = isCurrentViewingMonth && day === todayDayNum;

    // Today's live active work shift
    if (isToday && (workShift.isClockedIn || workShift.totalWorkedSeconds > 0)) {
      return {
        type: 'shift' as const,
        clockIn: workShift.clockInTime || 'Active Now',
        clockOut: workShift.isClockedIn ? 'Active Shift' : workShift.clockOutTime || 'Off Duty',
        hours: (workShift.totalWorkedSeconds / 3600).toFixed(1),
        overtime: (workShift.overtimeSeconds / 3600).toFixed(1),
        lateMinutes: getLateMinutes(workShift.clockInTime),
        status: workShift.isClockedIn ? ('active' as const) : ('completed' as const)
      };
    }

    // Matched team shift from persistent DB
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
        lateMinutes: getLateMinutes(matchedShift.clockInTime),
        status: matchedShift.status
      };
    }

    // Matched approved PTO request - only the current user's own leave
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

  const selectedDayData = getDayShiftInfo(selectedDay);

  // Real-time monthly summary stats - scoped to the current user only
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const userMonthShifts = teamShifts.filter(
    s => (s.userId === userProfile.id || s.userName === userProfile.name) && s.date.startsWith(monthPrefix)
  );
  const hasTodayRecorded = userMonthShifts.some(s => s.date === todayDateStr);

  let totalMonthWorkedSecs = userMonthShifts.reduce((acc, s) => acc + (s.totalWorkedSeconds || 0), 0);
  let totalMonthOtSecs = userMonthShifts.reduce((acc, s) => acc + (s.overtimeSeconds || 0), 0);
  let totalLateCount = 0;
  let totalLateMins = 0;

  userMonthShifts.forEach(s => {
    const lateM = getLateMinutes(s.clockInTime);
    if (lateM > 0) {
      totalLateCount += 1;
      totalLateMins += lateM;
    }
  });

  if (isCurrentViewingMonth && !hasTodayRecorded && workShift.totalWorkedSeconds > 0) {
    totalMonthWorkedSecs += workShift.totalWorkedSeconds;
    totalMonthOtSecs += workShift.overtimeSeconds;
    const todayLateM = getLateMinutes(workShift.clockInTime);
    if (todayLateM > 0) {
      totalLateCount += 1;
      totalLateMins += todayLateM;
    }
  }

  const totalMonthHours = (totalMonthWorkedSecs / 3600).toFixed(1);
  const totalMonthOtHours = (totalMonthOtSecs / 3600).toFixed(1);

  const monthPtoDays = ptoRequests
    .filter(r => (r.userId === userProfile.id || r.userName === userProfile.name) &&
      r.status === 'approved' && (r.startDate.startsWith(monthPrefix) || r.endDate.startsWith(monthPrefix)))
    .reduce((acc, r) => acc + r.totalDays, 0);

  const totalCompletedShifts = userMonthShifts.length + (isCurrentViewingMonth && (workShift.isClockedIn || workShift.totalWorkedSeconds > 0) ? 1 : 0);
  const onTimeRate = totalCompletedShifts > 0
    ? `${Math.round(((totalCompletedShifts - totalLateCount) / totalCompletedShifts) * 100)}%`
    : '100%';

  const dayCellSize = variant === 'modal' ? 'h-16 sm:h-20' : 'h-16';

  const dayCell = (day: number) => {
    const shiftInfo = getDayShiftInfo(day);
    const isSelected = selectedDay === day;
    const isToday = isCurrentViewingMonth && day === todayDayNum;

    return (
      <button
        type="button"
        key={`day-${day}`}
        onClick={() => setSelectedDay(day)}
        className={`${dayCellSize} p-1.5 sm:p-2 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative group ${
          isSelected
            ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500 shadow-md'
            : isToday
            ? isDarkMode
              ? 'bg-blue-950/40 border-blue-500/60'
              : 'bg-blue-50/90 border-blue-400'
            : shiftInfo.type === 'shift'
            ? parseFloat(shiftInfo.overtime) > 0
              ? isDarkMode
                ? 'bg-amber-950/20 border-amber-800/40 hover:border-amber-500'
                : 'bg-amber-50/50 border-amber-200 hover:border-amber-400'
              : shiftInfo.lateMinutes && shiftInfo.lateMinutes > 0
              ? isDarkMode
                ? 'bg-rose-950/20 border-rose-800/40 hover:border-rose-500'
                : 'bg-rose-50/50 border-rose-200 hover:border-rose-400'
              : isDarkMode
              ? 'bg-[#12141c] border-[#252834] hover:border-blue-500/50'
              : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-blue-400'
            : shiftInfo.type === 'pto'
            ? isDarkMode
              ? 'bg-cyan-950/30 border-cyan-800/50'
              : 'bg-cyan-50 border-cyan-200'
            : isDarkMode
            ? 'bg-[#10121a]/60 border-slate-800/40 opacity-50'
            : 'bg-slate-50/60 border-slate-100 opacity-50'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className={`text-xs font-black ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
            {day}
          </span>
          {isToday && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />}
        </div>

        {shiftInfo.type === 'shift' && (
          <div className="text-[9px] sm:text-[10px] leading-tight">
            <span className="font-extrabold text-blue-600 dark:text-blue-400 block truncate">
              {shiftInfo.hours}h
            </span>
            {shiftInfo.lateMinutes && shiftInfo.lateMinutes > 0 ? (
              <span className="text-[8px] font-bold text-rose-500 block truncate">
                +{formatLateDuration(shiftInfo.lateMinutes)} Late
              </span>
            ) : parseFloat(shiftInfo.overtime) > 0 ? (
              <span className="text-[8px] sm:text-[9px] font-bold text-amber-500 block truncate">
                +{shiftInfo.overtime}h OT
              </span>
            ) : (
              <span className="text-[8px] text-slate-400 block truncate hidden sm:block">
                {shiftInfo.clockIn}
              </span>
            )}
          </div>
        )}

        {shiftInfo.type === 'pto' && (
          <div className="text-[8px] sm:text-[9px] font-bold text-cyan-600 dark:text-cyan-400 truncate">
            🧘 Rest
          </div>
        )}

        {shiftInfo.type === 'weekend' && (
          <div className="text-[8px] text-slate-400 hidden sm:block">Off</div>
        )}

        {shiftInfo.type === 'upcoming' && (
          <div className="text-[8px] text-slate-400 hidden sm:block">9 AM</div>
        )}
      </button>
    );
  };

  const calendarGrid = (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1.5 text-center mb-1">
        {WEEKDAY_LABELS.map(dayName => (
          <span key={dayName} className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
            {dayName}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`pad-${i}`} className={`${dayCellSize} rounded-2xl bg-transparent opacity-0`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => dayCell(i + 1))}
      </div>
    </div>
  );

  const monthNavigator = (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto shadow-2xs">
      <button
        type="button"
        onClick={handlePrevMonth}
        className="p-1 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
        title="Previous Month"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-xs font-black px-2 text-slate-800 dark:text-slate-200">
        {MONTH_NAMES[month]} {year}
      </span>
      <button
        type="button"
        onClick={handleNextMonth}
        className="p-1 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
        title="Next Month"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );

  const inspectorAndStats = (
    <div className="space-y-4">
      <div className={`p-4.5 rounded-2xl border ${isDarkMode ? 'bg-[#12141c] border-[#252834]' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <div>
              <h4 className="text-xs font-black">
                {MONTH_NAMES[month]} {selectedDay}, {year}
              </h4>
              <span className="text-[10px] text-slate-400">
                {isCurrentViewingMonth && selectedDay === todayDayNum ? "Today's Active Shift" : 'Shift History Report'}
              </span>
            </div>
          </div>
          {selectedDayData.type === 'shift' && parseFloat(selectedDayData.overtime) > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border bg-amber-500/10 text-amber-500 border-amber-500/30">
              +{selectedDayData.overtime}h OT
            </span>
          ) : selectedDayData.type === 'shift' && selectedDayData.lateMinutes && selectedDayData.lateMinutes > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border bg-rose-500/10 text-rose-500 border-rose-500/30">
              +{formatLateDuration(selectedDayData.lateMinutes)} Late
            </span>
          ) : null}
        </div>

        {selectedDayData.type === 'shift' ? (
          <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Time In</span>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <strong className="text-blue-600 dark:text-blue-400 font-extrabold text-sm">
                  {selectedDayData.clockIn}
                </strong>
                {selectedDayData.lateMinutes && selectedDayData.lateMinutes > 0 ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-rose-500/15 text-rose-500 border border-rose-500/30">
                    +{formatLateDuration(selectedDayData.lateMinutes)} Late
                  </span>
                ) : (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    On-Time
                  </span>
                )}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Time Out</span>
              <strong className="text-slate-800 dark:text-slate-200 font-extrabold text-sm block mt-0.5">
                {selectedDayData.clockOut}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Duration</span>
              <strong className="text-slate-800 dark:text-slate-200 font-extrabold text-sm block mt-0.5">
                {selectedDayData.hours} Hours
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Overtime</span>
              <strong className={`${parseFloat(selectedDayData.overtime) > 0 ? 'text-amber-500' : 'text-slate-400'} font-extrabold text-sm block mt-0.5`}>
                {selectedDayData.overtime}h OT
              </strong>
            </div>
          </div>
        ) : selectedDayData.type === 'pto' ? (
          <div className="mt-3 text-xs flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold">
            <Palmtree className="w-4 h-4" />
            <span>{selectedDayData.label}{selectedDayData.reason ? ` • ${selectedDayData.reason}` : ''}</span>
          </div>
        ) : (
          <div className="mt-3 text-xs text-slate-400">Scheduled Weekend / Off-Duty Rest Day</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-[#12141c] border-[#252834]' : 'bg-slate-50 border-slate-200'}`}>
          <span className="text-[10px] font-bold text-slate-400 block">Total Work Logged</span>
          <span className="text-lg font-black text-slate-900 dark:text-white block mt-0.5">{totalMonthHours}h</span>
        </div>

        <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-emerald-50/70 border-emerald-200'}`}>
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 block">On-Time Rate</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">{onTimeRate}</span>
        </div>

        <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-amber-950/20 border-amber-800/40' : 'bg-amber-50/70 border-amber-200'}`}>
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 block">Total Overtime</span>
          <span className="text-lg font-black text-amber-600 dark:text-amber-400 block mt-0.5">{parseFloat(totalMonthOtHours) > 0 ? `+${totalMonthOtHours}h` : '0.0h'}</span>
        </div>

        <div className={`p-3 rounded-2xl border ${
          totalLateCount > 0
            ? isDarkMode ? 'bg-rose-950/20 border-rose-800/40' : 'bg-rose-50/70 border-rose-200'
            : isDarkMode ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-emerald-50/70 border-emerald-200'
        }`}>
          <span className={`text-[10px] font-bold block ${totalLateCount > 0 ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
            Late Arrival
          </span>
          <span className={`text-lg font-black block mt-0.5 ${totalLateCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {totalLateCount > 0 ? `${totalLateCount} (${formatLateDuration(totalLateMins)})` : '0 Late (0h 0m)'}
          </span>
        </div>
      </div>
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className={`enterprise-card p-6 border ${isDarkMode ? 'border-slate-800 bg-[#16181f]' : 'border-slate-200 bg-white'} space-y-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`text-base font-black flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Monthly Attendance & Workday Shift Calendar
            </h3>
            <Tooltip
              icon="info"
              align="left"
              content={
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    Attendance & Shift History
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    View your shift logs, on-time records, overtime tracking, and monthly attendance history.
                  </p>
                </div>
              }
            />
          </div>
          {monthNavigator}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">{calendarGrid}</div>
          {inspectorAndStats}
        </div>
      </div>
    );
  }

  // Modal variant
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-5 sm:p-7 transition-all ${
          isDarkMode
            ? 'bg-[#14161e] border-[#2e323e] text-white shadow-black/60'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
      >
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

        <div className="my-5">{monthNavigator}</div>

        <div className="mb-5">{calendarGrid}</div>

        {inspectorAndStats}

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

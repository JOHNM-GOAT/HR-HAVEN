import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { isSupabaseConfigured } from '../../../lib/supabase/client';
import { WorkShiftRecord } from '../../../types/wellness';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'work_shifts.json');

const defaultShifts: WorkShiftRecord[] = [];

function ensureShiftsFile(): WorkShiftRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultShifts, null, 2), 'utf-8');
      return defaultShifts;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return defaultShifts;
  } catch (err) {
    console.error('Error reading work shifts file:', err);
    return defaultShifts;
  }
}

function writeShiftsFile(data: WorkShiftRecord[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing work shifts file:', err);
  }
}

export async function GET() {
  try {
    const diskShifts = ensureShiftsFile();

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        const { data: dbShifts, error } = await supabase
          .from('work_shifts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && dbShifts && Array.isArray(dbShifts)) {
          const formatted: WorkShiftRecord[] = dbShifts.map((s: any) => ({
            id: s.id,
            userId: s.user_id || 'user-default',
            userName: s.user_name || 'Team Member',
            userAvatar: s.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            department: s.department || 'General',
            date: s.date || new Date().toISOString().split('T')[0],
            clockInTime: s.clock_in_time,
            clockOutTime: s.clock_out_time || null,
            totalWorkedSeconds: parseInt(s.total_worked_seconds, 10) || 0,
            overtimeSeconds: parseInt(s.overtime_seconds, 10) || 0,
            status: s.status || (s.clock_out_time ? 'completed' : 'active'),
            createdAt: s.created_at || new Date().toISOString()
          }));

          writeShiftsFile(formatted);
          return NextResponse.json({ shifts: formatted, source: 'supabase' });
        }
      } catch (supabaseErr) {
        console.warn('Supabase work shifts fetch notice:', supabaseErr);
      }
    }

    return NextResponse.json({ shifts: diskShifts, source: 'local_disk' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, shift, shiftId, clockOutTime, totalWorkedSeconds, overtimeSeconds } = body;

    const currentShifts = ensureShiftsFile();

    if (action === 'clock_in' && shift) {
      const newShift: WorkShiftRecord = {
        id: shift.id || `shift-${Date.now()}`,
        userId: shift.userId || 'user-default',
        userName: shift.userName || 'Employee',
        userAvatar: shift.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        department: shift.department || 'Engineering',
        date: shift.date || new Date().toISOString().split('T')[0],
        clockInTime: shift.clockInTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        clockOutTime: null,
        totalWorkedSeconds: 0,
        overtimeSeconds: 0,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      // De-duplicate: If an active shift with the same id or created within the last 3 seconds exists for this user, do not duplicate
      const recentDup = currentShifts.find(s =>
        s.id === newShift.id ||
        (s.userId === newShift.userId && s.status === 'active' && Math.abs(new Date(s.createdAt).getTime() - new Date(newShift.createdAt).getTime()) < 3000)
      );
      if (recentDup) {
        return NextResponse.json({ success: true, shift: recentDup, shifts: currentShifts });
      }

      // Replace any existing active shift for this user or prepend
      const filtered = currentShifts.filter(s => !(s.userId === newShift.userId && s.status === 'active'));
      const updated = [newShift, ...filtered];
      writeShiftsFile(updated);

      if (isSupabaseConfigured()) {
        try {
          const supabase = await createServerSupabaseClient();
          // First complete any old active shift for this user in Supabase to maintain uniqueness
          await supabase
            .from('work_shifts')
            .update({ status: 'completed', clock_out_time: newShift.clockInTime })
            .eq('user_id', newShift.userId)
            .eq('status', 'active');

          await supabase.from('work_shifts').insert({
            id: newShift.id,
            user_id: newShift.userId,
            user_name: newShift.userName,
            user_avatar: newShift.userAvatar,
            department: newShift.department,
            date: newShift.date,
            clock_in_time: newShift.clockInTime,
            clock_out_time: null,
            total_worked_seconds: 0,
            overtime_seconds: 0,
            status: 'active',
            created_at: newShift.createdAt
          });
        } catch (supabaseErr) {
          console.warn('Supabase work_shift insert notice:', supabaseErr);
        }
      }

      return NextResponse.json({ success: true, shift: newShift, shifts: updated });
    }

    if (action === 'clock_out' && (shiftId || body.userId)) {
      const targetUserId = body.userId || (shift && shift.userId);
      const outTime = clockOutTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const finalWorked = typeof totalWorkedSeconds === 'number' ? totalWorkedSeconds : 0;
      const finalOvertime = typeof overtimeSeconds === 'number' ? overtimeSeconds : 0;

      let found = false;
      const updated = currentShifts.map(s => {
        if ((shiftId && s.id === shiftId) || (!shiftId && targetUserId && s.userId === targetUserId && s.status === 'active')) {
          found = true;
          return {
            ...s,
            clockOutTime: outTime,
            totalWorkedSeconds: finalWorked || s.totalWorkedSeconds,
            overtimeSeconds: finalOvertime || s.overtimeSeconds,
            status: 'completed' as const
          };
        }
        return s;
      });

      // If no active record exists on disk, create completed record
      if (!found && targetUserId) {
        const completedShift: WorkShiftRecord = {
          id: shiftId || `shift-${Date.now()}`,
          userId: targetUserId,
          userName: body.userName || 'System Administrator',
          userAvatar: body.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          department: body.department || 'Executive IT',
          date: new Date().toISOString().split('T')[0],
          clockInTime: body.clockInTime || outTime,
          clockOutTime: outTime,
          totalWorkedSeconds: finalWorked,
          overtimeSeconds: finalOvertime,
          status: 'completed',
          createdAt: new Date().toISOString()
        };
        updated.unshift(completedShift);
      }

      writeShiftsFile(updated);

      if (isSupabaseConfigured()) {
        try {
          const supabase = await createServerSupabaseClient();
          if (shiftId) {
            await supabase
              .from('work_shifts')
              .update({
                clock_out_time: outTime,
                total_worked_seconds: finalWorked,
                overtime_seconds: finalOvertime,
                status: 'completed'
              })
              .eq('id', shiftId);
          } else if (targetUserId) {
            await supabase
              .from('work_shifts')
              .update({
                clock_out_time: outTime,
                total_worked_seconds: finalWorked,
                overtime_seconds: finalOvertime,
                status: 'completed'
              })
              .eq('user_id', targetUserId)
              .eq('status', 'active');
          }
        } catch (supabaseErr) {
          console.warn('Supabase work_shift update notice:', supabaseErr);
        }
      }

      return NextResponse.json({ success: true, shifts: updated });
    }

    if (action === 'heartbeat' && shiftId) {
      const updated = currentShifts.map(s => {
        if (s.id === shiftId && s.status === 'active') {
          return {
            ...s,
            totalWorkedSeconds: totalWorkedSeconds ?? s.totalWorkedSeconds,
            overtimeSeconds: overtimeSeconds ?? s.overtimeSeconds
          };
        }
        return s;
      });

      writeShiftsFile(updated);
      return NextResponse.json({ success: true, shifts: updated });
    }

    return NextResponse.json({ error: 'Invalid action or payload' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

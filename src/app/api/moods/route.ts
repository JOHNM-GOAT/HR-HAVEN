import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { initialMoodLogs } from '../../../data/initialData';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { isSupabaseConfigured } from '../../../lib/supabase/client';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'moods.json');

function ensureMoodsFile(): any[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialMoodLogs, null, 2), 'utf-8');
      return initialMoodLogs;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return initialMoodLogs;
  } catch (err) {
    console.error('Error reading moods database file:', err);
    return initialMoodLogs;
  }
}

function writeMoodsFile(data: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing moods database file:', err);
  }
}

export async function GET() {
  try {
    const diskMoods = ensureMoodsFile();

    // 1. If Supabase configured, query Supabase PostgreSQL mood_logs table
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        const { data: dbMoods, error } = await supabase
          .from('mood_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && dbMoods && dbMoods.length > 0) {
          const formatted = dbMoods.map((m: any) => ({
            id: m.id,
            mood: m.mood,
            energyLevel: m.energy_level,
            note: m.note || undefined,
            isAnonymousToHr: m.is_anonymous ?? true,
            timestamp: m.created_at ? new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today',
            createdAt: m.created_at || new Date().toISOString()
          }));

          writeMoodsFile(formatted);
          return NextResponse.json({ moodLogs: formatted, source: 'supabase' });
        }
      } catch (supabaseErr) {
        console.warn('Supabase moods fetch notice:', supabaseErr);
      }
    }

    return NextResponse.json({ moodLogs: diskMoods, source: 'disk' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { moodLog, userProfile } = body;

    if (!moodLog) {
      return NextResponse.json({ error: 'Mood log payload is required' }, { status: 400 });
    }

    const newMoodLog = {
      id: moodLog.id || `mood-${Date.now()}`,
      mood: moodLog.mood || 'good',
      energyLevel: moodLog.energyLevel || 3,
      note: moodLog.note || undefined,
      isAnonymousToHr: moodLog.isAnonymousToHr ?? true,
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };

    // 1. Save to local disk database
    const current = ensureMoodsFile();
    const updated = [newMoodLog, ...current];
    writeMoodsFile(updated);

    // 2. Save to Supabase PostgreSQL mood_logs table if live
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        await supabase.from('mood_logs').insert({
          user_name: userProfile?.name || 'Anonymous Employee',
          department: userProfile?.department || 'General',
          mood: newMoodLog.mood,
          energy_level: newMoodLog.energyLevel,
          note: newMoodLog.note || null,
          is_anonymous: newMoodLog.isAnonymousToHr,
          created_at: newMoodLog.createdAt
        });
      } catch (supabaseErr) {
        console.warn('Supabase mood insert notice:', supabaseErr);
      }
    }

    return NextResponse.json({ success: true, moodLog: newMoodLog });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

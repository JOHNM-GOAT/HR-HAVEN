import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { initialHrNotifications } from '../../../data/initialData';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { isSupabaseConfigured } from '../../../lib/supabase/client';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'notifications.json');

function ensureNotificationsFile(): any[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialHrNotifications, null, 2), 'utf-8');
      return initialHrNotifications;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return initialHrNotifications;
  } catch (err) {
    console.error('Error reading notifications database file:', err);
    return initialHrNotifications;
  }
}

function writeNotificationsFile(data: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing notifications database file:', err);
  }
}

export async function GET() {
  try {
    const diskNotifs = ensureNotificationsFile();

    // 1. If live Supabase is configured, fetch from Supabase PostgreSQL
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        const { data: dbNotifs, error } = await supabase
          .from('hr_notifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && dbNotifs && dbNotifs.length > 0) {
          const formatted = dbNotifs.map((n: any) => ({
            id: n.id,
            type: n.type || 'teammate_flag',
            targetTeammate: n.target_teammate,
            reason: n.reason,
            submittedByAnonymous: n.submitted_by_anonymous ?? true,
            status: n.status || 'pending',
            severity: n.severity || 'medium',
            actionNote: n.action_note,
            timestamp: n.created_at ? new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Live DB Alert'
          }));

          writeNotificationsFile(formatted);
          return NextResponse.json({ notifications: formatted, source: 'supabase' });
        }
      } catch (supabaseErr) {
        console.warn('Supabase notifications fetch notice:', supabaseErr);
      }
    }

    return NextResponse.json({ notifications: diskNotifs, source: 'disk' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, notification, id, actionNote } = body;

    const current = ensureNotificationsFile();

    if (action === 'create' && notification) {
      const newNotif = {
        id: notification.id || `hr-notif-${Date.now()}`,
        type: notification.type || 'teammate_flag',
        targetTeammate: notification.targetTeammate,
        reason: notification.reason,
        submittedByAnonymous: notification.submittedByAnonymous ?? true,
        status: notification.status || 'pending',
        severity: notification.severity || 'high',
        timestamp: 'Just now',
        createdAt: new Date().toISOString()
      };

      const updated = [newNotif, ...current];
      writeNotificationsFile(updated);

      // Insert into Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          const supabase = await createServerSupabaseClient();
          await supabase.from('hr_notifications').insert({
            type: newNotif.type,
            target_teammate: newNotif.targetTeammate,
            reason: newNotif.reason,
            submitted_by_anonymous: newNotif.submittedByAnonymous,
            status: newNotif.status,
            severity: newNotif.severity,
            created_at: new Date().toISOString()
          });
        } catch (supabaseErr) {
          console.warn('Supabase notification insert notice:', supabaseErr);
        }
      }

      return NextResponse.json({ success: true, notification: newNotif });
    }

    if (action === 'resolve' && id) {
      const updated = current.map((n: any) =>
        n.id === id ? { ...n, status: 'resolved', actionNote: actionNote || 'Outreach logged' } : n
      );
      writeNotificationsFile(updated);

      // Update in Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          const supabase = await createServerSupabaseClient();
          await supabase.from('hr_notifications').update({
            status: 'resolved',
            action_note: actionNote || 'Outreach logged'
          }).eq('id', id);
        } catch (supabaseErr) {
          console.warn('Supabase notification update notice:', supabaseErr);
        }
      }

      return NextResponse.json({ success: true, id, status: 'resolved' });
    }

    if (action === 'dismiss' && id) {
      const updated = current.filter((n: any) => n.id !== id);
      writeNotificationsFile(updated);

      // Delete from Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          const supabase = await createServerSupabaseClient();
          await supabase.from('hr_notifications').delete().eq('id', id);
        } catch (supabaseErr) {
          console.warn('Supabase notification delete notice:', supabaseErr);
        }
      }

      return NextResponse.json({ success: true, id, status: 'dismissed' });
    }

    return NextResponse.json({ error: 'Invalid notification action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

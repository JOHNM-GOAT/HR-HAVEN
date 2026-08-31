import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { isSupabaseConfigured } from '../../../lib/supabase/client';
import { Blocker, BlockerSeverity } from '../../../types/wellness';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'blockers.json');

interface BlockerRow {
  id: string;
  description: string;
  severity: string | null;
  score_impact: number | null;
  created_at: string | null;
  resolved_at: string | null;
  user_name: string | null;
  department: string | null;
}

const errorMessage = (error: unknown): string => (error instanceof Error ? error.message : 'Unknown error');

function ensureBlockersFile(): Blocker[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading blockers database file:', err);
    return [];
  }
}

function writeBlockersFile(data: Blocker[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing blockers database file:', err);
  }
}

export async function GET() {
  try {
    const diskBlockers = ensureBlockersFile();

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        const { data: dbBlockers, error } = await supabase
          .from('blockers')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && dbBlockers) {
          const formatted: Blocker[] = (dbBlockers as BlockerRow[]).map((b) => ({
            id: b.id,
            description: b.description,
            severity: (b.severity || 'medium') as BlockerSeverity,
            scoreImpact: b.score_impact ?? 0,
            createdAt: b.created_at || new Date().toISOString(),
            resolvedAt: b.resolved_at || undefined,
            userName: b.user_name || undefined,
            department: b.department || undefined
          }));

          writeBlockersFile(formatted);
          return NextResponse.json({ blockers: formatted, source: 'supabase' });
        }
      } catch (supabaseErr) {
        console.warn('Supabase blockers fetch notice:', supabaseErr);
      }
    }

    return NextResponse.json({ blockers: diskBlockers, source: 'disk' });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, blocker, userProfile, id, resolvedAt } = body;

    const current = ensureBlockersFile();

    if (action === 'create' && blocker) {
      const newBlocker: Blocker = {
        id: blocker.id || `blocker-${Date.now()}`,
        description: blocker.description,
        severity: blocker.severity || 'medium',
        scoreImpact: blocker.scoreImpact ?? 0,
        createdAt: blocker.createdAt || new Date().toISOString(),
        resolvedAt: blocker.resolvedAt,
        userName: userProfile?.name || 'Anonymous Employee',
        department: userProfile?.department || 'General'
      };

      const updated = [newBlocker, ...current];
      writeBlockersFile(updated);

      if (isSupabaseConfigured()) {
        try {
          const supabase = await createServerSupabaseClient();
          await supabase.from('blockers').insert({
            id: newBlocker.id,
            user_id: userProfile?.id || null,
            user_name: userProfile?.name || 'Anonymous Employee',
            department: userProfile?.department || 'General',
            description: newBlocker.description,
            severity: newBlocker.severity,
            score_impact: newBlocker.scoreImpact,
            created_at: newBlocker.createdAt
          });
        } catch (supabaseErr) {
          console.warn('Supabase blocker insert notice:', supabaseErr);
        }
      }

      return NextResponse.json({ success: true, blocker: newBlocker });
    }

    if (action === 'resolve' && id) {
      const updated = current.map(b => (b.id === id ? { ...b, resolvedAt: resolvedAt || new Date().toISOString() } : b));
      writeBlockersFile(updated);

      if (isSupabaseConfigured()) {
        try {
          const supabase = await createServerSupabaseClient();
          await supabase
            .from('blockers')
            .update({ resolved_at: resolvedAt || new Date().toISOString() })
            .eq('id', id);
        } catch (supabaseErr) {
          console.warn('Supabase blocker resolve notice:', supabaseErr);
        }
      }

      return NextResponse.json({ success: true, blockers: updated });
    }

    return NextResponse.json({ error: 'Invalid action or payload' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

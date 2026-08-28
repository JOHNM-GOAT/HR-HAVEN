import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { initialBadges } from '../../../data/initialData';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { isSupabaseConfigured } from '../../../lib/supabase/client';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'badges.json');

function ensureBadgesFile(): any[] {
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
    if (Array.isArray(parsed)) {
      const cleaned = parsed
        .filter((b: any) => b.id !== 'b1' && b.id !== 'b2' && b.id !== 'b3')
        .map((b: any) => ({
          ...b,
          senderName: (b.senderName || '').replace(/\s*\(You\)/gi, '').trim(),
          recipientName: (b.recipientName || '').replace(/\s*\(You\)/gi, '').trim()
        }));
      if (cleaned.length !== parsed.length || JSON.stringify(cleaned) !== raw) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(cleaned, null, 2), 'utf-8');
      }
      return cleaned;
    }
    return [];
  } catch (err) {
    console.error('Error reading badges database file:', err);
    return [];
  }
}

function writeBadgesFile(data: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing badges database file:', err);
  }
}

export async function GET() {
  try {
    const diskBadges = ensureBadgesFile();

    // 1. If Supabase configured, query Supabase PostgreSQL peer_badges table
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        const { data: dbBadges, error } = await supabase
          .from('peer_badges')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && dbBadges && dbBadges.length > 0) {
          const formatted = dbBadges
            .filter((b: any) => b.id !== 'b1' && b.id !== 'b2' && b.id !== 'b3')
            .map((b: any) => ({
              id: b.id,
              senderName: (b.sender_name || 'Colleague').replace(/\s*\(You\)/gi, '').trim(),
              senderAvatar: b.sender_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              recipientName: (b.recipient_name || '').replace(/\s*\(You\)/gi, '').trim(),
              recipientAvatar: b.recipient_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
              badgeType: b.badge_type,
              message: b.message,
              virtualCoffeeSent: b.send_coffee ?? false,
              timestamp: b.created_at ? new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Just now',
              createdAt: b.created_at || new Date().toISOString()
            }));

          writeBadgesFile(formatted);
          return NextResponse.json({ badges: formatted, source: 'supabase' });
        }
      } catch (supabaseErr) {
        console.warn('Supabase badges fetch notice:', supabaseErr);
      }
    }

    return NextResponse.json({ badges: diskBadges, source: 'disk' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { badge } = body;

    if (!badge) {
      return NextResponse.json({ error: 'Badge payload is required' }, { status: 400 });
    }

    const cleanSender = (badge.senderName || 'Colleague').replace(/\s*\(You\)/gi, '').trim();
    const cleanRecipient = (badge.recipientName || '').replace(/\s*\(You\)/gi, '').trim();

    const newBadge = {
      id: badge.id || `badge-${Date.now()}`,
      senderName: cleanSender,
      senderAvatar: badge.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      recipientName: cleanRecipient,
      recipientAvatar: badge.recipientAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      badgeType: badge.badgeType || 'lifesaver',
      message: badge.message,
      virtualCoffeeSent: badge.virtualCoffeeSent ?? false,
      timestamp: 'Just now',
      createdAt: new Date().toISOString()
    };

    // 1. Save to local disk store
    const current = ensureBadgesFile();
    const updated = [newBadge, ...current];
    writeBadgesFile(updated);

    // 2. Save to Supabase PostgreSQL peer_badges table if live
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        await supabase.from('peer_badges').insert({
          sender_name: newBadge.senderName,
          recipient_name: newBadge.recipientName,
          badge_type: newBadge.badgeType,
          message: newBadge.message,
          send_coffee: newBadge.virtualCoffeeSent,
          created_at: new Date().toISOString()
        });
      } catch (supabaseErr) {
        console.warn('Supabase peer badge insert notice:', supabaseErr);
      }
    }

    return NextResponse.json({ success: true, badge: newBadge });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const badgeId = searchParams.get('id');

    const current = ensureBadgesFile();
    const updated = badgeId ? current.filter((b: any) => b.id !== badgeId) : [];
    writeBadgesFile(updated);

    if (isSupabaseConfigured() && badgeId) {
      try {
        const supabase = await createServerSupabaseClient();
        await supabase.from('peer_badges').delete().eq('id', badgeId);
      } catch (e) {}
    }

    return NextResponse.json({ success: true, badges: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

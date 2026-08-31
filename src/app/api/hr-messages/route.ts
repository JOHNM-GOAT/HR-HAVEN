import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { isSupabaseConfigured } from '../../../lib/supabase/client';
import { HrOutreachMessage } from '../../../types/wellness';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'hr_messages.json');

interface OutreachRow {
  id: string;
  alert_id: string | null;
  sender_name: string;
  recipient_name: string;
  message: string;
  created_at: string | null;
}

const errorMessage = (error: unknown): string => (error instanceof Error ? error.message : 'Unknown error');

function ensureMessagesFile(): HrOutreachMessage[] {
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
    console.error('Error reading HR messages database file:', err);
    return [];
  }
}

function writeMessagesFile(data: HrOutreachMessage[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing HR messages database file:', err);
  }
}

export async function GET() {
  try {
    const diskMessages = ensureMessagesFile();

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        const { data: dbMessages, error } = await supabase
          .from('hr_outreach_messages')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && dbMessages) {
          const formatted: HrOutreachMessage[] = (dbMessages as OutreachRow[]).map((m) => ({
            id: m.id,
            alertId: m.alert_id || undefined,
            senderName: m.sender_name,
            recipientName: m.recipient_name,
            message: m.message,
            createdAt: m.created_at || new Date().toISOString()
          }));

          writeMessagesFile(formatted);
          return NextResponse.json({ messages: formatted, source: 'supabase' });
        }
      } catch (supabaseErr) {
        console.warn('Supabase HR messages fetch notice:', supabaseErr);
      }
    }

    return NextResponse.json({ messages: diskMessages, source: 'disk' });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || !message.recipientName || !message.message) {
      return NextResponse.json({ error: 'A message with recipientName and message text is required' }, { status: 400 });
    }

    const newMessage: HrOutreachMessage = {
      id: message.id || `outreach-${Date.now()}`,
      alertId: message.alertId,
      senderName: message.senderName || 'HR Team',
      recipientName: message.recipientName,
      message: message.message,
      createdAt: message.createdAt || new Date().toISOString()
    };

    const current = ensureMessagesFile();
    const updated = [newMessage, ...current];
    writeMessagesFile(updated);

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        await supabase.from('hr_outreach_messages').insert({
          id: newMessage.id,
          alert_id: newMessage.alertId || null,
          sender_name: newMessage.senderName,
          recipient_name: newMessage.recipientName,
          message: newMessage.message,
          created_at: newMessage.createdAt
        });
      } catch (supabaseErr) {
        console.warn('Supabase HR message insert notice:', supabaseErr);
      }
    }

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

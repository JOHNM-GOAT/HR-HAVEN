import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { initialPtoRequests } from '../../../data/initialData';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { isSupabaseConfigured } from '../../../lib/supabase/client';
import { PtoRequest } from '../../../types/wellness';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'pto_requests.json');

function ensurePtoFile(): PtoRequest[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialPtoRequests, null, 2), 'utf-8');
      return initialPtoRequests;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const cleaned = parsed.filter(p => p.id !== 'pto-2' && p.id !== 'pto-1' && p.userName !== 'Elena Rostova');
      if (cleaned.length !== parsed.length) {
        writePtoFile(cleaned);
      }
      return cleaned;
    }
    return initialPtoRequests;
  } catch (err) {
    console.error('Error reading PTO file:', err);
    return initialPtoRequests;
  }
}

function writePtoFile(data: PtoRequest[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing PTO file:', err);
  }
}

export async function GET() {
  try {
    const diskPto = ensurePtoFile();

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        const { data: dbPto, error } = await supabase
          .from('pto_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && dbPto && dbPto.length > 0) {
          const formatted: PtoRequest[] = dbPto.map((r: any) => ({
            id: r.id,
            userId: r.user_id || 'user-default',
            userName: r.user_name || 'Team Member',
            userAvatar: r.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            department: r.department || 'General',
            category: r.category || 'vacation',
            startDate: r.start_date,
            endDate: r.end_date,
            totalDays: parseFloat(r.total_days) || 1,
            reason: r.reason || '',
            status: r.status || 'pending',
            autoApproved: r.auto_approved ?? false,
            reviewedBy: r.reviewed_by,
            reviewedAt: r.reviewed_at,
            createdAt: r.created_at || new Date().toISOString()
          }));

          writePtoFile(formatted);
          return NextResponse.json({ ptoRequests: formatted, source: 'supabase' });
        }
      } catch (supabaseErr) {
        console.warn('Supabase PTO fetch notice:', supabaseErr);
      }
    }

    return NextResponse.json({ ptoRequests: diskPto, source: 'local_disk' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ptoRequest, requestId, status, reviewedBy } = body;

    const currentPto = ensurePtoFile();

    if (action === 'create' && ptoRequest) {
      // 1-Day Mental Health or Birthday leave is auto-approved
      const isAutoApproved =
        (ptoRequest.category === 'mental_health' && ptoRequest.totalDays <= 1) ||
        ptoRequest.category === 'birthday';

      const newRequest: PtoRequest = {
        id: ptoRequest.id || `pto-${Date.now()}`,
        userId: ptoRequest.userId || 'user-default',
        userName: ptoRequest.userName || 'Employee',
        userAvatar: ptoRequest.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        department: ptoRequest.department || 'Engineering',
        category: ptoRequest.category || 'vacation',
        startDate: ptoRequest.startDate,
        endDate: ptoRequest.endDate,
        totalDays: ptoRequest.totalDays || 1,
        reason: ptoRequest.reason || '',
        status: isAutoApproved ? 'approved' : 'pending',
        autoApproved: isAutoApproved,
        reviewedBy: isAutoApproved ? 'AI Wellness Guard (Auto-Approved)' : undefined,
        reviewedAt: isAutoApproved ? new Date().toISOString().split('T')[0] : undefined,
        createdAt: new Date().toISOString()
      };

      const updated = [newRequest, ...currentPto];
      writePtoFile(updated);

      if (isSupabaseConfigured()) {
        try {
          const supabase = await createServerSupabaseClient();
          await supabase.from('pto_requests').insert({
            user_id: newRequest.userId,
            user_name: newRequest.userName,
            user_avatar: newRequest.userAvatar,
            department: newRequest.department,
            category: newRequest.category,
            start_date: newRequest.startDate,
            end_date: newRequest.endDate,
            total_days: newRequest.totalDays,
            reason: newRequest.reason,
            status: newRequest.status,
            auto_approved: newRequest.autoApproved,
            reviewed_by: newRequest.reviewedBy,
            created_at: newRequest.createdAt
          });
        } catch (supabaseErr) {
          console.warn('Supabase PTO insert notice:', supabaseErr);
        }
      }

      return NextResponse.json({ success: true, ptoRequest: newRequest });
    }

    if (action === 'review' && requestId && status) {
      const updated = currentPto.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: status as 'approved' | 'rejected',
            reviewedBy: reviewedBy || 'HR Executive',
            reviewedAt: new Date().toISOString().split('T')[0]
          };
        }
        return r;
      });

      writePtoFile(updated);

      if (isSupabaseConfigured()) {
        try {
          const supabase = await createServerSupabaseClient();
          await supabase
            .from('pto_requests')
            .update({
              status,
              reviewed_by: reviewedBy || 'HR Executive'
            })
            .eq('id', requestId);
        } catch (supabaseErr) {
          console.warn('Supabase PTO review notice:', supabaseErr);
        }
      }

      return NextResponse.json({ success: true, ptoRequests: updated });
    }

    if (action === 'cancel' && requestId) {
      const updated = currentPto.map(r => (r.id === requestId ? { ...r, status: 'cancelled' as const } : r));
      writePtoFile(updated);

      if (isSupabaseConfigured()) {
        try {
          const supabase = await createServerSupabaseClient();
          await supabase.from('pto_requests').update({ status: 'cancelled' }).eq('id', requestId);
        } catch (e) {}
      }

      return NextResponse.json({ success: true, ptoRequests: updated });
    }

    return NextResponse.json({ error: 'Invalid action or payload' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

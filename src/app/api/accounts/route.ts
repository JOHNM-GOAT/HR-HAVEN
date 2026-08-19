import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { initialUserAccounts, initialDeletedAccounts } from '../../../data/initialData';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { isSupabaseConfigured } from '../../../lib/supabase/client';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'accounts.json');

interface StoredData {
  accounts: any[];
  deletedAccounts: any[];
}

function ensureDataFile(): StoredData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const defaultData: StoredData = {
        accounts: initialUserAccounts,
        deletedAccounts: initialDeletedAccounts
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.accounts || !Array.isArray(parsed.accounts)) {
      parsed.accounts = initialUserAccounts;
    }
    // Ensure root admin always exists
    const hasAdmin = parsed.accounts.some((a: any) => a.role === 'admin' || a.email === 'admin@axionhr.com');
    if (!hasAdmin) {
      parsed.accounts = [initialUserAccounts[0], ...parsed.accounts];
    }
    return parsed;
  } catch (err) {
    console.error('Error reading accounts database file:', err);
    return {
      accounts: initialUserAccounts,
      deletedAccounts: initialDeletedAccounts
    };
  }
}

function writeDataFile(data: StoredData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing accounts database file:', err);
  }
}

export async function GET() {
  try {
    const diskData = ensureDataFile();

    // 1. If live Supabase is configured, fetch from Supabase PostgreSQL
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        const { data: profiles, error } = await supabase.from('profiles').select('*');

        if (!error && profiles) {
          // If Supabase is empty or has fewer accounts than disk, sync disk accounts into Supabase
          if (diskData.accounts && diskData.accounts.length > 0) {
            for (const localAcc of diskData.accounts) {
              const existsInSupabase = profiles.some((p: any) => p.email.toLowerCase() === localAcc.email.toLowerCase());
              if (!existsInSupabase) {
                try {
                  await supabase.from('profiles').insert({
                    id: localAcc.id,
                    name: localAcc.name,
                    email: localAcc.email,
                    password: localAcc.password || 'password123',
                    role: localAcc.role,
                    department: localAcc.department,
                    status: localAcc.status || 'active',
                    avatar_url: localAcc.avatarUrl,
                    created_at: new Date().toISOString()
                  });
                } catch (insErr) {
                  console.warn('Sync to Supabase notice:', insErr);
                }
              }
            }
          }

          // Re-fetch updated profiles
          const { data: refreshedProfiles } = await supabase.from('profiles').select('*');
          const finalProfiles = refreshedProfiles || profiles;

          if (finalProfiles.length > 0) {
            const accounts = finalProfiles
              .filter((p: any) => !p.deleted_at)
              .map((p: any) => ({
                id: p.id,
                name: p.name,
                email: p.email,
                password: p.password || 'password123',
                role: p.role,
                department: p.department,
                status: p.status || 'active',
                avatarUrl: p.avatar_url,
                createdAt: p.created_at ? p.created_at.split('T')[0] : '2026-01-01',
                lastActive: 'Active recently'
              }));

            const deletedAccounts = finalProfiles
              .filter((p: any) => p.deleted_at)
              .map((p: any) => ({
                id: p.id,
                name: p.name,
                email: p.email,
                password: p.password || 'password123',
                role: p.role,
                department: p.department,
                status: 'disabled',
                avatarUrl: p.avatar_url,
                createdAt: p.created_at ? p.created_at.split('T')[0] : '2026-01-01',
                lastActive: 'Archived',
                deletedAt: p.deleted_at,
                deletedBy: p.deleted_by || 'System Admin',
                deletionReason: p.deletion_reason || 'Deprovisioned'
              }));

            // Also keep local disk updated
            writeDataFile({ accounts, deletedAccounts });

            return NextResponse.json({ accounts, deletedAccounts, source: 'supabase' });
          }
        }
      } catch (supabaseErr) {
        console.warn('Supabase fetch notice, falling back to server disk:', supabaseErr);
      }
    }

    // 2. Read from persistent server disk storage
    return NextResponse.json({ ...diskData, source: 'disk' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, account, accountId, updates, reason, accounts, deletedAccounts } = body;

    // 1. If syncing full state
    if (action === 'sync_all' && Array.isArray(accounts)) {
      const data: StoredData = {
        accounts: accounts,
        deletedAccounts: Array.isArray(deletedAccounts) ? deletedAccounts : []
      };
      writeDataFile(data);
      return NextResponse.json({ success: true, message: 'Accounts synchronized to server disk' });
    }

    // 2. Read current stored data
    const currentData = ensureDataFile();

    if (action === 'create' && account) {
      const newAcc = {
        ...account,
        id: account.id || `usr-${Date.now().toString().slice(-4)}`,
        createdAt: account.createdAt || new Date().toISOString().split('T')[0],
        lastActive: 'Just now'
      };
      currentData.accounts = [newAcc, ...currentData.accounts];

      // Save to Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          const supabase = await createServerSupabaseClient();
          await supabase.from('profiles').insert({
            id: newAcc.id,
            name: newAcc.name,
            email: newAcc.email,
            role: newAcc.role,
            department: newAcc.department,
            status: newAcc.status,
            avatar_url: newAcc.avatarUrl,
            created_at: new Date().toISOString()
          });
        } catch (e) {
          console.warn('Supabase insert notice:', e);
        }
      }
    } else if (action === 'update' && (accountId || account)) {
      const effectiveId = accountId || account?.id;
      const effectiveUpdates = updates || account || {};

      currentData.accounts = currentData.accounts.map((a: any) => {
        if ((effectiveId && a.id === effectiveId) || (effectiveUpdates.email && a.email?.toLowerCase() === effectiveUpdates.email?.toLowerCase())) {
          return { ...a, ...effectiveUpdates };
        }
        return a;
      });

      // Update Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          const supabase = await createServerSupabaseClient();
          const supabaseUpdates: any = {};
          if (effectiveUpdates.name) supabaseUpdates.name = effectiveUpdates.name;
          if (effectiveUpdates.email) supabaseUpdates.email = effectiveUpdates.email;
          if (effectiveUpdates.password) supabaseUpdates.password = effectiveUpdates.password;
          if (effectiveUpdates.department) supabaseUpdates.department = effectiveUpdates.department;
          if (effectiveUpdates.role) supabaseUpdates.role = effectiveUpdates.role;
          if (effectiveUpdates.status) supabaseUpdates.status = effectiveUpdates.status;
          if (effectiveUpdates.avatarUrl) supabaseUpdates.avatar_url = effectiveUpdates.avatarUrl;

          if (effectiveId) {
            await supabase.from('profiles').update(supabaseUpdates).eq('id', effectiveId);
          }
          if (effectiveUpdates.email) {
            await supabase.from('profiles').update(supabaseUpdates).eq('email', effectiveUpdates.email);
          }
        } catch (e) {
          console.warn('Supabase update notice:', e);
        }
      }
    } else if (action === 'delete' && accountId) {
      const target = currentData.accounts.find((a: any) => a.id === accountId);
      if (target) {
        const now = new Date();
        const timeString = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' +
          now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const deletedRecord = {
          ...target,
          deletedAt: timeString,
          deletedBy: 'System Admin',
          deletionReason: reason || 'Account deprovisioned by admin'
        };
        currentData.accounts = currentData.accounts.filter((a: any) => a.id !== accountId);
        currentData.deletedAccounts = [deletedRecord, ...currentData.deletedAccounts];

        // Soft delete in Supabase if configured
        if (isSupabaseConfigured()) {
          try {
            const supabase = await createServerSupabaseClient();
            await supabase.from('profiles').update({
              deleted_at: now.toISOString(),
              deleted_by: 'System Admin',
              deletion_reason: reason || 'Account deprovisioned by admin'
            }).eq('id', accountId);
          } catch (e) {
            console.warn('Supabase delete notice:', e);
          }
        }
      }
    } else if (action === 'recover' && accountId) {
      const target = currentData.deletedAccounts.find((a: any) => a.id === accountId);
      if (target) {
        const { deletedAt, deletedBy, deletionReason, ...accountData } = target;
        const restoredAccount = {
          ...accountData,
          status: 'active',
          lastActive: 'Recovered just now'
        };
        currentData.deletedAccounts = currentData.deletedAccounts.filter((a: any) => a.id !== accountId);
        currentData.accounts = [restoredAccount, ...currentData.accounts];

        // Restore in Supabase if configured
        if (isSupabaseConfigured()) {
          try {
            const supabase = await createServerSupabaseClient();
            await supabase.from('profiles').update({
              deleted_at: null,
              deleted_by: null,
              deletion_reason: null,
              status: 'active'
            }).eq('id', accountId);
          } catch (e) {
            console.warn('Supabase recover notice:', e);
          }
        }
      }
    } else if (action === 'purge' && accountId) {
      currentData.deletedAccounts = currentData.deletedAccounts.filter((a: any) => a.id !== accountId);

      // Hard delete in Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          const supabase = await createServerSupabaseClient();
          await supabase.from('profiles').delete().eq('id', accountId);
        } catch (e) {
          console.warn('Supabase purge notice:', e);
        }
      }
    }

    writeDataFile(currentData);
    return NextResponse.json({ success: true, data: currentData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

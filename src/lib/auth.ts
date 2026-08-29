import fs from 'fs';
import path from 'path';
import { UserAccount, UserRole } from '../types/wellness';

const ACCOUNTS_FILE = path.join(process.cwd(), '.data', 'accounts.json');

export function getAccountById(userId: string | undefined | null): UserAccount | null {
  if (!userId) return null;
  try {
    if (!fs.existsSync(ACCOUNTS_FILE)) return null;
    const raw = fs.readFileSync(ACCOUNTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const accounts: UserAccount[] = Array.isArray(parsed?.accounts) ? parsed.accounts : [];
    return accounts.find(a => a.id === userId) || null;
  } catch {
    return null;
  }
}

export function hasElevatedRole(role: UserRole | undefined | null): boolean {
  return role === 'admin' || role === 'hr_manager';
}

import { redirect } from 'next/navigation';
import {
  clearSessionCookie,
  invalidateSessionToken,
  readSessionTokenFromCookie,
  requireDb,
} from '@/lib/server/auth';

export async function GET() {
  const token = await readSessionTokenFromCookie();
  if (token) {
    try {
      const db = await requireDb();
      await invalidateSessionToken(db, token);
    } catch {
      // Still clear the browser cookie even if D1 is temporarily unavailable.
    }
  }
  await clearSessionCookie();
  redirect('/');
}

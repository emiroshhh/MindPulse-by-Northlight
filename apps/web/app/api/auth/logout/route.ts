import {
  clearSessionCookie,
  invalidateSessionToken,
  json,
  readSessionTokenFromCookie,
  requireDb,
} from '@/lib/server/auth';

export async function POST() {
  const token = await readSessionTokenFromCookie();
  if (token) {
    try {
      const db = await requireDb();
      await invalidateSessionToken(db, token);
    } catch {
      // Cookie clearing is still safe even if D1 is temporarily unavailable.
    }
  }
  await clearSessionCookie();
  return json({ ok: true });
}

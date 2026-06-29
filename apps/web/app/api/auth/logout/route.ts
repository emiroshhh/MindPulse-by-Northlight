import {
  clearSessionCookie,
  clearSessionCookieHeader,
  invalidateSessionToken,
  json,
  readSessionTokenFromCookie,
  readTokenFromRequest,
  requireDb,
} from '@/lib/server/auth';

export async function POST(request: Request) {
  // Prefer the request Cookie header (reliable on Cloudflare Workers).
  const token =
    readTokenFromRequest(request) ??
    (await readSessionTokenFromCookie().catch(() => null));

  if (token) {
    try {
      const db = await requireDb();
      await invalidateSessionToken(db, token);
    } catch {
      // Cookie clearing is still safe even if D1 is temporarily unavailable.
    }
  }

  // Belt-and-suspenders: try the Next.js cookies() path too.
  await clearSessionCookie().catch(() => undefined);

  const response = json({ ok: true });
  response.headers.append('Set-Cookie', clearSessionCookieHeader());
  return response;
}

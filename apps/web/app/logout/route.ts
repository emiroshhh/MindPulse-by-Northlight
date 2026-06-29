import {
  clearSessionCookie,
  clearSessionCookieHeaders,
  invalidateSessionToken,
  logoutSuccessHtmlResponse,
  readSessionTokenFromCookie,
  readTokenFromRequest,
  requireDb,
} from '@/lib/server/auth';

export async function GET(request: Request) {
  // Prefer the request Cookie header (reliable on Cloudflare Workers).
  // Fall back to Next.js cookies() in case the request object is unavailable.
  const token =
    readTokenFromRequest(request) ??
    (await readSessionTokenFromCookie().catch(() => null));

  if (token) {
    try {
      const db = await requireDb();
      await invalidateSessionToken(db, token);
    } catch {
      // Still clear the browser cookie even if D1 is temporarily unavailable.
    }
  }

  // Belt-and-suspenders: try the Next.js cookies() path too.
  await clearSessionCookie().catch(() => undefined);

  return logoutSuccessHtmlResponse(clearSessionCookieHeaders());
}

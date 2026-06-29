import {
  clientIp,
  createSession,
  getAuthDb,
  json,
  normalizeEmail,
  publicUser,
  sessionCookieHeader,
  setSessionCookie,
  validateEmail,
  verifyPassword,
  type AuthUser,
} from '@/lib/server/auth';
import { checkRateLimit } from '@/lib/server/rate-limit';

type UserRow = AuthUser & { password_hash: string };

export async function POST(request: Request) {
  const ip = await clientIp();
  if (!checkRateLimit(`login:${ip}`, 8, 60_000))
    return json({ error: 'rate_limited' }, 429);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_request' }, 400);
  }
  const input =
    body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const email = normalizeEmail(
    typeof input.email === 'string' ? input.email : '',
  );
  const password = typeof input.password === 'string' ? input.password : '';
  if (!validateEmail(email) || !password)
    return json({ error: 'Invalid email or password' }, 401);

  try {
    const db = await getAuthDb();
    const user = await db
      .prepare(
        `SELECT id, email, password_hash, name, created_at
         FROM users WHERE email = ? LIMIT 1`,
      )
      .bind(email)
      .first<UserRow>();
    if (!user) return json({ error: 'Invalid email or password' }, 401);
    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) return json({ error: 'Invalid email or password' }, 401);
    const session = await createSession(db, user.id);
    // Belt-and-suspenders: try the Next.js cookies() path, then attach an
    // explicit Set-Cookie header which is reliable on Cloudflare Workers.
    await setSessionCookie(session.token, session.expires).catch(() => undefined);
    const response = json({ user: publicUser(user) });
    response.headers.append('Set-Cookie', sessionCookieHeader(session.token, session.expires));
    return response;
  } catch (error) {
    console.error('[MindPulse] login failed:', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: (error instanceof Error
        ? error.message
        : 'Unknown login failure'
      )
        .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
        .replace(/[A-Za-z0-9_-]{32,}/g, '[redacted]')
        .slice(0, 180),
    });
    return json({ error: 'auth_unavailable' }, 503);
  }
}

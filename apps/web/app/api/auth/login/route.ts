import {
  authSuccessHtmlResponse,
  clientIp,
  createSession,
  getAuthDb,
  json,
  normalizeEmail,
  publicUser,
  sessionCookieHeaders,
  setSessionCookie,
  validateEmail,
  verifyPassword,
  type AuthUser,
} from '@/lib/server/auth';
import { checkRateLimit } from '@/lib/server/rate-limit';

type UserRow = AuthUser & { password_hash: string };

export async function POST(request: Request) {
  const wantsJson = isJsonRequest(request);
  const ip = await clientIp();
  if (!checkRateLimit(`login:${ip}`, 8, 60_000)) {
    if (!wantsJson) return formErrorRedirect('/login', 'rate_limited');
    return json({ error: 'rate_limited' }, 429);
  }

  const input = await readAuthInput(request, wantsJson);
  if (!input) {
    if (!wantsJson) return formErrorRedirect('/login', 'invalid');
    return json({ error: 'invalid_request' }, 400);
  }
  const email = normalizeEmail(
    typeof input.email === 'string' ? input.email : '',
  );
  const password = typeof input.password === 'string' ? input.password : '';
  if (!validateEmail(email) || !password) {
    if (!wantsJson) return formErrorRedirect('/login', 'invalid');
    return json({ error: 'Invalid email or password' }, 401);
  }

  try {
    const db = await getAuthDb();
    const user = await db
      .prepare(
        `SELECT id, email, password_hash, name, created_at
         FROM users WHERE email = ? LIMIT 1`,
      )
      .bind(email)
      .first<UserRow>();
    if (!user) {
      if (!wantsJson) return formErrorRedirect('/login', 'invalid');
      return json({ error: 'Invalid email or password' }, 401);
    }
    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      if (!wantsJson) return formErrorRedirect('/login', 'invalid');
      return json({ error: 'Invalid email or password' }, 401);
    }
    const session = await createSession(db, user.id);
    // Belt-and-suspenders: try the Next.js cookies() path, then attach an
    // explicit Set-Cookie header which is reliable on Cloudflare Workers.
    await setSessionCookie(session.token, session.expires).catch(() => undefined);
    const cookieHeaders = sessionCookieHeaders(session.token, session.expires);
    if (!wantsJson)
      return authSuccessHtmlResponse(cookieHeaders, '/app');
    const response = json({ user: publicUser(user) });
    for (const cookie of cookieHeaders)
      response.headers.append('Set-Cookie', cookie);
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
    if (!wantsJson) return formErrorRedirect('/login', 'unavailable');
    return json({ error: 'auth_unavailable' }, 503);
  }
}

function isJsonRequest(request: Request) {
  return Boolean(request.headers
    .get('content-type')
    ?.toLowerCase()
    .includes('application/json'));
}

async function readAuthInput(request: Request, wantsJson: boolean) {
  try {
    if (wantsJson) {
      const body = await request.json();
      return body && typeof body === 'object'
        ? (body as Record<string, unknown>)
        : {};
    }
    const form = await request.formData();
    return Object.fromEntries(form.entries());
  } catch {
    return null;
  }
}

function formErrorRedirect(path: string, code: string) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: `${path}?error=${encodeURIComponent(code)}`,
      'Cache-Control': 'no-store',
    },
  });
}

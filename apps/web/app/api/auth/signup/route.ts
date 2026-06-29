import {
  authSuccessHtmlResponse,
  clientIp,
  createSession,
  getAuthDb,
  getUserBySessionToken,
  hashPassword,
  json,
  normalizeEmail,
  publicUser,
  secureId,
  sessionCookieHeaders,
  setSessionCookie,
  validateEmail,
  validatePassword,
} from '@/lib/server/auth';
import { checkRateLimit } from '@/lib/server/rate-limit';

export async function POST(request: Request) {
  let step = 'start';
  const wantsJson = isJsonRequest(request);
  const ip = await clientIp();
  if (!checkRateLimit(`signup:${ip}`, 5, 60_000)) {
    if (!wantsJson) return formErrorRedirect('/signup', 'rate_limited');
    return json({ error: 'rate_limited' }, 429);
  }

  const input = await readAuthInput(request, wantsJson);
  if (!input) {
    if (!wantsJson) return formErrorRedirect('/signup', 'invalid');
    return json({ error: 'invalid_request' }, 400);
  }
  const email = normalizeEmail(
    typeof input.email === 'string' ? input.email : '',
  );
  const password = typeof input.password === 'string' ? input.password : '';
  const name =
    typeof input.name === 'string' && input.name.trim()
      ? input.name.trim().slice(0, 80)
      : email.split('@')[0] || 'Student';

  if (!validateEmail(email)) {
    if (!wantsJson) return formErrorRedirect('/signup', 'invalid');
    return json({ error: 'Please enter a valid email address.' }, 400);
  }
  if (!validatePassword(password)) {
    if (!wantsJson) return formErrorRedirect('/signup', 'invalid');
    return json({ error: 'Password must be at least 10 characters.' }, 400);
  }

  try {
    step = 'get_auth_db';
    const db = await getAuthDb();
    step = 'check_existing_user';
    const existing = await db
      .prepare('SELECT id FROM users WHERE email = ? LIMIT 1')
      .bind(email)
      .first<{ id: string }>();
    if (existing) {
      if (!wantsJson) return formErrorRedirect('/signup', 'invalid');
      return json({ error: 'An account already exists.' }, 409);
    }

    const now = new Date().toISOString();
    const user = {
      id: secureId('user'),
      email,
      name,
      created_at: now,
    };
    step = 'hash_password';
    const passwordHash = await hashPassword(password);
    step = 'insert_user';
    await db
      .prepare(
        `INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(user.id, email, passwordHash, name, now, now)
      .run();
    step = 'create_session';
    const session = await createSession(db, user.id);
    const resolved = await getUserBySessionToken(db, session.token);
    if (!resolved) {
      console.error('[MindPulse] session created but not resolvable');
    }
    step = 'set_cookie';
    // Belt-and-suspenders: try the Next.js cookies() path, then attach an
    // explicit Set-Cookie header which is reliable on Cloudflare Workers.
    await setSessionCookie(session.token, session.expires).catch(() => undefined);
    const cookieHeaders = sessionCookieHeaders(session.token, session.expires);
    if (!wantsJson)
      return authSuccessHtmlResponse(cookieHeaders, '/app', session.token);
    const response = json(
      { user: publicUser(user), sessionToken: session.token },
      201,
    );
    for (const cookie of cookieHeaders)
      response.headers.append('Set-Cookie', cookie);
    return response;
  } catch (error) {
    console.error(
      '[MindPulse] signup failed:',
      sanitizeSignupError(error, step),
    );
    if (!wantsJson) return formErrorRedirect('/signup', 'unavailable');
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

function sanitizeSignupError(error: unknown, step: string) {
  const rawMessage =
    error instanceof Error ? error.message : 'Unknown signup failure';
  return {
    step,
    name: error instanceof Error ? error.name : 'UnknownError',
    message: rawMessage
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
      .replace(/pbkdf2-sha256\$[^\s'"]+/g, '[password_hash]')
      .replace(/[A-Za-z0-9_-]{32,}/g, '[redacted]')
      .slice(0, 180),
  };
}

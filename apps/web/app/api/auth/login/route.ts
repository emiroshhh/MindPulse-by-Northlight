import {
  clientIp,
  createSession,
  getAuthDb,
  hashPassword,
  json,
  normalizeEmail,
  publicUser,
  secureId,
  setSessionCookie,
  validateEmail,
  validatePassword,
} from '@/lib/server/auth';
import { checkRateLimit } from '@/lib/server/rate-limit';

export async function POST(request: Request) {
  let step = 'start';
  const ip = await clientIp();
  if (!checkRateLimit(`signup:${ip}`, 5, 60_000))
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
  const name =
    typeof input.name === 'string' && input.name.trim()
      ? input.name.trim().slice(0, 80)
      : email.split('@')[0] || 'Student';

  if (!validateEmail(email))
    return json({ error: 'Please enter a valid email address.' }, 400);
  if (!validatePassword(password))
    return json({ error: 'Password must be at least 10 characters.' }, 400);

  try {
    step = 'get_auth_db';
    const db = await getAuthDb();
    step = 'check_existing_user';
    const existing = await db
      .prepare('SELECT id FROM users WHERE email = ? LIMIT 1')
      .bind(email)
      .first<{ id: string }>();
    if (existing) return json({ error: 'An account already exists.' }, 409);

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
    step = 'set_cookie';
    await setSessionCookie(session.token, session.expires);
    return json({ user: publicUser(user) }, 201);
  } catch (error) {
    console.error(
      '[MindPulse] signup failed:',
      sanitizeSignupError(error, step),
    );
    return json({ error: 'auth_unavailable' }, 503);
  }
}

function sanitizeSignupError(error: unknown, step: string) {
  const rawMessage =
    error instanceof Error ? error.message : 'Unknown signup failure';
  return {
    step,
    name: error instanceof Error ? error.name : 'UnknownError',
    message: rawMessage
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
      .replace(/pbkdf2-sha256\$[^\s'"]+/g, '[passw
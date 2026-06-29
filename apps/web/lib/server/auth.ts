import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies, headers } from 'next/headers';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};

type D1Result<T = unknown> = {
  results?: T[];
  success: boolean;
  error?: string;
};

type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
};

export type D1DatabaseLike = {
  prepare(query: string): D1PreparedStatement;
};

type WorkerBindings = {
  DB?: D1DatabaseLike;
  GEMINI_API_KEY?: string | undefined;
  GEMINI_MODEL?: string | undefined;
  SESSION_SECRET?: string | undefined;
};

const SESSION_COOKIE = 'mindpulse_session';
const HOST_SESSION_COOKIE = '__Host-mindpulse_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const MIN_SESSION_TOKEN_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 10;
// Cloudflare Workers' WebCrypto rejects PBKDF2 iteration counts above 100000
// in production, so this is the maximum supported value. The count is embedded
// in each stored hash, so verifyPassword always uses the count the hash was
// created with (older/newer hashes remain verifiable).
const PBKDF2_ITERATIONS = 100_000;
const encoder = new TextEncoder();
let schemaReady = false;

export function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function getBindings(): Promise<WorkerBindings> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env as WorkerBindings;
  } catch {
    return {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      GEMINI_MODEL: process.env.GEMINI_MODEL,
      SESSION_SECRET: process.env.SESSION_SECRET,
    };
  }
}

export async function requireDb() {
  const env = await getBindings();
  if (!env.DB) throw new Error('D1 DB binding is not configured');
  return env.DB;
}

export async function getAuthDb() {
  const db = await requireDb();
  await ensureAuthSchema(db);
  return db;
}

export async function getSessionSecret() {
  const env = await getBindings();
  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32)
    throw new Error('SESSION_SECRET must be configured and at least 32 chars');
  return env.SESSION_SECRET;
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validatePassword(password: string) {
  return password.length >= PASSWORD_MIN_LENGTH && password.length <= 200;
}

export function publicUser(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.created_at,
  };
}

// Argon2id is the preferred password KDF, but adding a native/wasm Argon2
// dependency to this OpenNext Cloudflare Worker would make deployment fragile.
// PBKDF2-SHA-256 is available in Workers WebCrypto, uses a unique salt per
// password, and avoids storing or logging raw passwords.
export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: PBKDF2_ITERATIONS,
    },
    key,
    256,
  );
  return `pbkdf2-sha256$${PBKDF2_ITERATIONS}$${base64Url(salt)}$${base64Url(
    new Uint8Array(bits),
  )}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, iterationsRaw, saltRaw, hashRaw] = stored.split('$');
  if (scheme !== 'pbkdf2-sha256' || !iterationsRaw || !saltRaw || !hashRaw)
    return false;
  const iterations = Number(iterationsRaw);
  if (!Number.isFinite(iterations) || iterations < 100_000) return false;
  const salt = fromBase64Url(saltRaw);
  const expected = fromBase64Url(hashRaw);
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    expected.length * 8,
  );
  return constantTimeEqual(new Uint8Array(bits), expected);
}

export async function createSession(db: D1DatabaseLike, userId: string) {
  const token = base64Url(crypto.getRandomValues(new Uint8Array(32)));
  const hash = await hashSessionToken(token);
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);
  const id = secureId('session');
  await db
    .prepare(
      `INSERT INTO sessions (id, user_id, session_hash, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(id, userId, hash, now.toISOString(), expires.toISOString())
    .run();
  return { token, expires };
}

export async function setSessionCookie(token: string, expires: Date) {
  const jar = await cookies();
  for (const name of [SESSION_COOKIE, HOST_SESSION_COOKIE]) {
    jar.set(name, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires,
    });
  }
}

export async function clearSessionCookie() {
  const jar = await cookies();
  for (const name of [SESSION_COOKIE, HOST_SESSION_COOKIE]) {
    jar.set(name, '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  }
}

// ---------------------------------------------------------------------------
// Explicit Set-Cookie header helpers
// On Cloudflare Workers / OpenNext, cookies().set() may not reliably write
// Set-Cookie headers in the outgoing response. These pure helpers produce a
// valid Set-Cookie string that callers append directly to a Response.
// ---------------------------------------------------------------------------

/** Returns a Set-Cookie header value that sets the session cookie. */
export function sessionCookieHeader(token: string, expires: Date): string {
  return sessionCookieHeaderFor(SESSION_COOKIE, token, expires);
}

/** Returns Set-Cookie header values for both legacy and host-prefixed cookies. */
export function sessionCookieHeaders(token: string, expires: Date): string[] {
  return [
    sessionCookieHeaderFor(HOST_SESSION_COOKIE, token, expires),
    sessionCookieHeaderFor(SESSION_COOKIE, token, expires),
  ];
}

function sessionCookieHeaderFor(
  name: string,
  token: string,
  expires: Date,
): string {
  return [
    `${name}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Expires=${expires.toUTCString()}`,
  ].join('; ');
}

/** Returns a Set-Cookie header value that immediately expires the session cookie. */
export function clearSessionCookieHeader(): string {
  return clearSessionCookieHeaderFor(SESSION_COOKIE);
}

/** Returns Set-Cookie header values that clear both session cookie names. */
export function clearSessionCookieHeaders(): string[] {
  return [
    clearSessionCookieHeaderFor(HOST_SESSION_COOKIE),
    clearSessionCookieHeaderFor(SESSION_COOKIE),
  ];
}

function clearSessionCookieHeaderFor(name: string): string {
  return [
    `${name}=`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ].join('; ');
}

export function authSuccessHtmlResponse(
  cookieHeaders: string[],
  redirectTo = '/app',
  sessionToken?: string,
) {
  const safeRedirect = redirectTo.startsWith('/') ? redirectTo : '/app';
  const safeRedirectAttribute = safeRedirect.replace(/"/g, '%22');
  const tokenStorageScript = sessionToken
    ? `  try { localStorage.setItem('mindpulse_session_token', ${JSON.stringify(
        sessionToken,
      )}); } catch {}\n`
    : '';
  const response = new Response(
    `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0;url=${safeRedirectAttribute}" />
  <title>Signing in...</title>
</head>
<body>
  <p>Signing you in...</p>
  <script>
${tokenStorageScript}  window.location.replace(${JSON.stringify(safeRedirect)});
  </script>
</body>
</html>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    },
  );
  for (const cookie of cookieHeaders)
    response.headers.append('Set-Cookie', cookie);
  return response;
}

export function logoutSuccessHtmlResponse(cookieHeaders: string[]) {
  const response = new Response(
    `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0;url=/" />
  <title>Signing out...</title>
</head>
<body>
  <p>Signing you out...</p>
  <script>
    try { localStorage.removeItem('mindpulse_session_token'); } catch {}
    window.location.replace('/');
  </script>
</body>
</html>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    },
  );
  for (const cookie of cookieHeaders)
    response.headers.append('Set-Cookie', cookie);
  return response;
}

/**
 * Reads the session token from the incoming request's Cookie header.
 * More reliable than cookies() on Cloudflare Workers.
 */
export function readTokenFromRequest(request: Request): string | null {
  return readSessionTokenFromRequest(request);
}

export type SessionTokenSource =
  | 'authorization'
  | 'x-header'
  | 'host-cookie'
  | 'cookie'
  | 'none';

export function readSessionTokenFromRequest(request: Request): string | null {
  return readSessionTokenWithSourceFromRequest(request).token;
}

export function readSessionTokenWithSourceFromRequest(request: Request): {
  token: string | null;
  source: SessionTokenSource;
} {
  const authorization = request.headers.get('authorization') ?? '';
  const bearerPrefix = 'Bearer ';
  if (authorization.startsWith(bearerPrefix)) {
    const token = normalizeSessionToken(authorization.slice(bearerPrefix.length));
    if (token) return { token, source: 'authorization' };
  }

  const headerToken = normalizeSessionToken(
    request.headers.get('x-mindpulse-session') ?? '',
  );
  if (headerToken) return { token: headerToken, source: 'x-header' };

  return readSessionTokenWithSourceFromHeader(
    request.headers.get('cookie') ?? '',
  );
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  let db: D1DatabaseLike;
  try {
    db = await getAuthDb();
  } catch {
    return null;
  }
  const jar = await cookies();
  const token =
    jar.get(HOST_SESSION_COOKIE)?.value ?? jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getUserBySessionToken(db, token);
}

export async function getCurrentUserFromRequest(
  request: Request,
): Promise<AuthUser | null> {
  let db: D1DatabaseLike;
  try {
    db = await getAuthDb();
  } catch {
    return null;
  }
  const token =
    readSessionTokenFromRequest(request) ??
    (await readSessionTokenFromCookie().catch(() => null));
  if (!token) return null;
  return getUserBySessionToken(db, token);
}

export async function getUserBySessionToken(
  db: D1DatabaseLike,
  token: string,
): Promise<AuthUser | null> {
  const sessionHash = await hashSessionToken(token);
  return db
    .prepare(
      `SELECT users.id, users.email, users.name, users.created_at
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.session_hash = ? AND sessions.expires_at > ?
       LIMIT 1`,
    )
    .bind(sessionHash, new Date().toISOString())
    .first<AuthUser>();
}

export async function invalidateSessionToken(
  db: D1DatabaseLike,
  token: string,
) {
  const sessionHash = await hashSessionToken(token);
  await db
    .prepare('DELETE FROM sessions WHERE session_hash = ?')
    .bind(sessionHash)
    .run();
}

export async function readSessionTokenFromCookie() {
  const jar = await cookies();
  return jar.get(HOST_SESSION_COOKIE)?.value ?? jar.get(SESSION_COOKIE)?.value ?? null;
}

function readSessionTokenWithSourceFromHeader(header: string): {
  token: string | null;
  source: SessionTokenSource;
} {
  const hostToken = normalizeSessionToken(
    readCookieValue(header, HOST_SESSION_COOKIE),
  );
  if (hostToken) return { token: hostToken, source: 'host-cookie' };

  const cookieToken = normalizeSessionToken(readCookieValue(header, SESSION_COOKIE));
  if (cookieToken) return { token: cookieToken, source: 'cookie' };

  return { token: null, source: 'none' };
}

function normalizeSessionToken(value: string | null) {
  const token = value?.trim();
  return token && token.length >= MIN_SESSION_TOKEN_LENGTH ? token : null;
}

function readCookieValue(header: string, name: string) {
  const prefix = `${name}=`;
  for (const part of header.split(';')) {
    const value = part.trim();
    if (value.startsWith(prefix))
      return decodeURIComponent(value.slice(prefix.length));
  }
  return null;
}

export async function clientIp() {
  const h = await headers();
  return (
    h.get('cf-connecting-ip') ??
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

export function secureId(prefix: string) {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${prefix}-${base64Url(crypto.getRandomValues(new Uint8Array(16)))}`;
}

async function hashSessionToken(token: string) {
  const secret = await getSessionSecret();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(token),
  );
  return base64Url(new Uint8Array(signature));
}

function base64Url(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '=',
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1)
    bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1)
    diff |= a[index]! ^ b[index]!;
  return diff === 0;
}

async function ensureAuthSchema(db: D1DatabaseLike) {
  if (schemaReady) return;
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      mode TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS agent_tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'saved',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS user_preferences (
      user_id TEXT PRIMARY KEY,
      data TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS daily_usage (
      id TEXT PRIMARY KEY,
      user_id TEXT NULL,
      guest_key TEXT NULL,
      usage_date TEXT NOT NULL,
      message_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_hash ON sessions(session_hash)`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created ON chat_messages(user_id, created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_agent_tasks_user_created ON agent_tasks(user_id, created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON daily_usage(user_id, usage_date)`,
    `CREATE INDEX IF NOT EXISTS idx_daily_usage_guest_date ON daily_usage(guest_key, usage_date)`,
  ];
  for (const statement of statements) await db.prepare(statement).run();

  // Repair partial early D1 schemas. SQLite/D1 cannot add NOT NULL columns
  // without defaults, so these are nullable for compatibility; new writes still
  // provide every value.
  for (const statement of [
    `ALTER TABLE users ADD COLUMN password_hash TEXT`,
    `ALTER TABLE users ADD COLUMN name TEXT DEFAULT ''`,
    `ALTER TABLE users ADD COLUMN created_at TEXT`,
    `ALTER TABLE users ADD COLUMN updated_at TEXT`,
  ]) {
    try {
      await db.prepare(statement).run();
    } catch {
      // D1 throws when the column already exists; that is the healthy path.
    }
  }
  schemaReady = true;
}

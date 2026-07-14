import {
  clearSessionCookieHeaders,
  getAuthDb,
  getCurrentUserFromRequest,
  json,
  verifyPassword,
} from '@/lib/server/auth';
import {
  checkRateLimitDurable,
  hashedLimiterKey,
} from '@/lib/server/rate-limit';

/**
 * Self-service account deletion. Requires the current password, then deletes
 * every user-owned row with explicit ordered statements (not relying on FK
 * cascade, because runtime-created legacy tables may predate the FKs) and
 * clears both session cookies.
 */
export async function POST(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return json({ error: 'unauthorized' }, 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_request' }, 400);
  }
  const password =
    body && typeof body === 'object' && 'password' in body
      ? String((body as Record<string, unknown>).password ?? '')
      : '';
  if (!password) return json({ error: 'password_required' }, 400);

  try {
    const db = await getAuthDb();
    const limiterKey = await hashedLimiterKey('delete-account', user.id);
    const allowed = await checkRateLimitDurable(
      db,
      limiterKey,
      3,
      24 * 60 * 60 * 1000,
    );
    if (!allowed) return json({ error: 'rate_limited' }, 429);

    const row = await db
      .prepare('SELECT password_hash FROM users WHERE id = ? LIMIT 1')
      .bind(user.id)
      .first<{ password_hash: string }>();
    if (!row) return json({ error: 'unauthorized' }, 401);
    const ok = await verifyPassword(password, row.password_hash);
    if (!ok) return json({ error: 'invalid_password' }, 401);

    for (const statement of [
      'DELETE FROM chat_messages WHERE user_id = ?',
      'DELETE FROM agent_tasks WHERE user_id = ?',
      'DELETE FROM user_preferences WHERE user_id = ?',
      'DELETE FROM daily_usage WHERE user_id = ?',
      'DELETE FROM sessions WHERE user_id = ?',
      'DELETE FROM users WHERE id = ?',
    ]) {
      await db.prepare(statement).bind(user.id).run();
    }

    // The client is responsible for clearing the localStorage fallback token.
    const response = json({ ok: true });
    for (const cookie of clearSessionCookieHeaders())
      response.headers.append('Set-Cookie', cookie);
    return response;
  } catch (error) {
    console.error('[MindPulse] account deletion failed:', {
      name: error instanceof Error ? error.name : 'UnknownError',
    });
    return json({ error: 'auth_unavailable' }, 503);
  }
}

function methodNotAllowed() {
  return Response.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'POST' } },
  );
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;

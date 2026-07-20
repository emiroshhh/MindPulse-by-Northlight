import { isBetaEvent } from '@mindpulse/shared';
import { clientIp, getAuthDb, json } from '../../../lib/server/auth';
import { recordEvent } from '../../../lib/server/events';
import {
  checkRateLimitDurable,
  hashedLimiterKey,
} from '../../../lib/server/rate-limit';

const DAY_MS = 24 * 60 * 60 * 1000;
const EVENTS_DAILY_LIMIT = 20;

/**
 * Client-side beta events (server-side flows increment their counters
 * directly). Only allowlisted names are accepted; everything else is a 400.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_event' }, 400);
  }
  const name =
    body && typeof body === 'object'
      ? (body as Record<string, unknown>).name
      : null;
  if (!isBetaEvent(name)) return json({ error: 'invalid_event' }, 400);

  try {
    const db = await getAuthDb();
    const ip = await clientIp();
    const userAgent = request.headers.get('user-agent') ?? 'unknown-agent';
    const limiterKey = await hashedLimiterKey('events', `${ip}|${userAgent}`);
    const allowed = await checkRateLimitDurable(
      db,
      limiterKey,
      EVENTS_DAILY_LIMIT,
      DAY_MS,
    );
    if (!allowed) return json({ error: 'rate_limited' }, 429);
    await recordEvent(db, name);
    return json({ ok: true });
  } catch {
    // Measurement never surfaces failures to users.
    return json({ ok: true });
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

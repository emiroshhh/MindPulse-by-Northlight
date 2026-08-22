import { getAuthDb, getBindings, type AuthUser } from './auth';

export const GUEST_DAILY_LIMIT = 5;
export const ACCOUNT_DAILY_LIMIT = 20;

export type DailyUsage = {
  allowed: boolean;
  limit: number;
  used: number;
  remaining: number;
  accountRequired: boolean;
};

export type GlobalAiCapacity =
  | { allowed: true; release: () => Promise<void> }
  | { allowed: false; reason: 'ai_disabled' | 'global_capacity_reached' };

export async function reserveGlobalAiCapacity(): Promise<GlobalAiCapacity> {
  const env = (await getBindings()) ?? {};
  if (env.AI_ENABLED?.trim().toLowerCase() === 'false')
    return { allowed: false, reason: 'ai_disabled' };
  const limits = [
    {
      bucket: `day:${new Date().toISOString().slice(0, 10)}`,
      limit: positiveInt(env.AI_GLOBAL_DAILY_LIMIT),
    },
    {
      bucket: `month:${new Date().toISOString().slice(0, 7)}`,
      limit: positiveInt(env.AI_GLOBAL_MONTHLY_LIMIT),
    },
  ].filter(
    (item): item is { bucket: string; limit: number } => item.limit !== null,
  );
  if (!limits.length) return { allowed: true, release: async () => {} };
  const db = await getAuthDb();
  const now = new Date().toISOString();
  const reserved: string[] = [];
  for (const item of limits) {
    const result = await db
      .prepare(
        `INSERT INTO ai_capacity (bucket, request_count, updated_at) VALUES (?, 1, ?) ON CONFLICT(bucket) DO UPDATE SET request_count = request_count + 1, updated_at = excluded.updated_at WHERE ai_capacity.request_count < ?`,
      )
      .bind(item.bucket, now, item.limit)
      .run();
    if (((result as { meta?: { changes?: number } }).meta?.changes ?? 0) < 1) {
      await releaseGlobalAiCapacity(reserved);
      return { allowed: false, reason: 'global_capacity_reached' };
    }
    reserved.push(item.bucket);
  }
  return { allowed: true, release: () => releaseGlobalAiCapacity(reserved) };
}

export async function refundDailyUsage({
  request,
  user,
}: {
  request: Request;
  user: AuthUser | null;
}) {
  const day = new Date().toISOString().slice(0, 10);
  const guestKey = user ? null : await guestUsageKey(request);
  const id = user ? `user:${user.id}:${day}` : `guest:${guestKey}:${day}`;
  const db = await getAuthDb();
  await db
    .prepare(
      'UPDATE daily_usage SET message_count = message_count - 1, updated_at = ? WHERE id = ? AND message_count > 0',
    )
    .bind(new Date().toISOString(), id)
    .run();
}

async function releaseGlobalAiCapacity(buckets: string[]) {
  if (!buckets.length) return;
  const db = await getAuthDb();
  await Promise.all(
    buckets.map((bucket) =>
      db
        .prepare(
          'UPDATE ai_capacity SET request_count = request_count - 1, updated_at = ? WHERE bucket = ? AND request_count > 0',
        )
        .bind(new Date().toISOString(), bucket)
        .run(),
    ),
  );
}

function positiveInt(value: string | undefined) {
  const number = Number(value?.trim());
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

/**
 * Atomically reserve one AI message from the caller's daily quota.
 * D1-backed, so it survives Worker restarts and coordinates across isolates.
 * The conditional upsert either increments under the limit (changes=1) or
 * does nothing (changes=0 → denied).
 */
export async function reserveDailyUsage({
  request,
  user,
}: {
  request: Request;
  user: AuthUser | null;
}): Promise<DailyUsage> {
  const db = await getAuthDb();
  const usageDate = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();
  const limit = user ? ACCOUNT_DAILY_LIMIT : GUEST_DAILY_LIMIT;
  const accountRequired = !user;
  const guestKey = user ? null : await guestUsageKey(request);
  const id = user
    ? `user:${user.id}:${usageDate}`
    : `guest:${guestKey}:${usageDate}`;

  const result = await db
    .prepare(
      `INSERT INTO daily_usage (
        id, user_id, guest_key, usage_date, message_count, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, 1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        message_count = message_count + 1,
        updated_at = excluded.updated_at
      WHERE daily_usage.message_count < ?`,
    )
    .bind(id, user?.id ?? null, guestKey, usageDate, now, now, limit)
    .run();
  const changes =
    (result as { meta?: { changes?: number } }).meta?.changes ?? 1;
  const row = await db
    .prepare('SELECT message_count FROM daily_usage WHERE id = ? LIMIT 1')
    .bind(id)
    .first<{ message_count: number }>();
  const used = Number(row?.message_count ?? limit);
  const allowed = changes > 0 && used <= limit;
  return {
    allowed,
    limit,
    used: Math.min(used, limit),
    remaining: Math.max(limit - used, 0),
    accountRequired,
  };
}

/**
 * Conservative anonymous key for guest quotas: a hash of ip|user-agent.
 * Not an identity system — documented as such in the README.
 */
export async function guestUsageKey(request: Request) {
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown-ip';
  const userAgent = request.headers.get('user-agent') ?? 'unknown-agent';
  const bytes = new TextEncoder().encode(`${ip}|${userAgent}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return base64Url(new Uint8Array(digest));
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

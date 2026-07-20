import {
  getAuthDb,
  getCurrentUserFromRequest,
  json,
  secureId,
} from '@/lib/server/auth';
import { recordEvent } from '@/lib/server/events';

const TASK_STATUSES = ['saved', 'in_progress', 'done'] as const;
type TaskStatus = (typeof TASK_STATUSES)[number];

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return json({ error: 'unauthorized' }, 401);
  const url = new URL(request.url);
  const kind = url.searchParams.get('kind');
  try {
    const db = await getAuthDb();
    const base = `SELECT id, title, content, status, kind, data, created_at, updated_at
         FROM agent_tasks
         WHERE user_id = ?`;
    const statement = kind
      ? db
          .prepare(`${base} AND kind = ? ORDER BY created_at DESC LIMIT 40`)
          .bind(user.id, kind)
      : db.prepare(`${base} ORDER BY created_at DESC LIMIT 40`).bind(user.id);
    const result = await statement.all();
    return json({ plans: result.results ?? [] });
  } catch {
    return json({ error: 'agent_unavailable' }, 503);
  }
}

/**
 * Update the status (and optionally the completion data) of a saved task.
 * Ownership is enforced in the WHERE clause — the row must belong to the
 * session user, so a foreign id updates nothing.
 */
export async function PATCH(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return json({ error: 'unauthorized' }, 401);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_request' }, 400);
  }
  const input =
    body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const id = typeof input.id === 'string' ? input.id : '';
  const status =
    typeof input.status === 'string' &&
    TASK_STATUSES.includes(input.status as TaskStatus)
      ? (input.status as TaskStatus)
      : null;
  const data =
    typeof input.data === 'string' && input.data.length <= 8000
      ? input.data
      : null;
  if (!id || !status) return json({ error: 'invalid_request' }, 400);

  try {
    const db = await getAuthDb();
    const now = new Date().toISOString();
    const result = data
      ? await db
          .prepare(
            `UPDATE agent_tasks SET status = ?, data = ?, updated_at = ?
             WHERE id = ? AND user_id = ?`,
          )
          .bind(status, data, now, id, user.id)
          .run()
      : await db
          .prepare(
            `UPDATE agent_tasks SET status = ?, updated_at = ?
             WHERE id = ? AND user_id = ?`,
          )
          .bind(status, now, id, user.id)
          .run();
    const changes =
      (result as { meta?: { changes?: number } }).meta?.changes ?? 0;
    if (!changes) return json({ error: 'not_found' }, 404);

    if (status === 'done') {
      const row = await db
        .prepare('SELECT kind FROM agent_tasks WHERE id = ? AND user_id = ?')
        .bind(id, user.id)
        .first<{ kind: string | null }>();
      if (row?.kind === 'recovery') await recordEvent(db, 'recovery_completed');
    }
    return json({ ok: true });
  } catch {
    return json({ error: 'agent_unavailable' }, 503);
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return json({ error: 'unauthorized' }, 401);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_request' }, 400);
  }
  const input =
    body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const title =
    typeof input.title === 'string' && input.title.trim()
      ? input.title.trim().slice(0, 120)
      : 'MindPulse plan';
  const content = typeof input.content === 'string' ? input.content.trim() : '';
  if (!content || content.length > 8000)
    return json({ error: 'invalid_content' }, 400);
  // Recovery plans are created only via /api/recovery (validated JSON).
  const kind =
    typeof input.kind === 'string' &&
    ['plan', 'tool_result'].includes(input.kind)
      ? input.kind
      : 'plan';
  try {
    const db = await getAuthDb();
    const now = new Date().toISOString();
    const id = secureId('agent');
    await db
      .prepare(
        `INSERT INTO agent_tasks (id, user_id, title, content, status, kind, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'saved', ?, ?, ?)`,
      )
      .bind(id, user.id, title, content, kind, now, now)
      .run();
    if (kind === 'tool_result') await recordEvent(db, 'tool_result_saved');
    return json(
      { plan: { id, title, content, status: 'saved', kind, created_at: now } },
      201,
    );
  } catch {
    return json({ error: 'agent_unavailable' }, 503);
  }
}

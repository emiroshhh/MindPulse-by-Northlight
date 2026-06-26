import { getAuthDb, getCurrentUser, json } from '@/lib/server/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return json({ error: 'unauthorized' }, 401);
  try {
    const db = await getAuthDb();
    const result = await db
      .prepare(
        `SELECT id, title, content, status, created_at, updated_at
         FROM agent_tasks
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 40`,
      )
      .bind(user.id)
      .all();
    return json({ plans: result.results ?? [] });
  } catch {
    return json({ error: 'agent_unavailable' }, 503);
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
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
  try {
    const db = await getAuthDb();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO agent_tasks (id, user_id, title, content, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'saved', ?, ?)`,
      )
      .bind(id, user.id, title, content, now, now)
      .run();
    return json(
      { plan: { id, title, content, status: 'saved', created_at: now } },
      201,
    );
  } catch {
    return json({ error: 'agent_unavailable' }, 503);
  }
}

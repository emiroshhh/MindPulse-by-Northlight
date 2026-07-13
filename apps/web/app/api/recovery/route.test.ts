// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => {
  const usage = new Map<string, number>();
  const inserted: unknown[][] = [];
  const events: string[] = [];
  const prepare = vi.fn((query: string) => ({
    bind: (...values: unknown[]) => ({
      run: vi.fn(async () => {
        if (query.includes('INSERT INTO daily_usage')) {
          const id = String(values[0]);
          const limit = Number(values[values.length - 1]);
          const current = usage.get(id) ?? 0;
          if (current >= limit) return { success: true, meta: { changes: 0 } };
          usage.set(id, current + 1);
          return { success: true, meta: { changes: 1 } };
        }
        if (query.includes('INSERT INTO agent_tasks')) inserted.push(values);
        if (query.includes('INSERT INTO events'))
          events.push(String(values[0]));
        return { success: true, meta: { changes: 1 } };
      }),
      first: vi.fn(async () => {
        if (query.includes('SELECT message_count FROM daily_usage')) {
          return { message_count: usage.get(String(values[0])) ?? 0 };
        }
        return null;
      }),
    }),
  }));
  return {
    getCurrentUserFromRequest: vi.fn(),
    getAuthDb: vi.fn().mockResolvedValue({ prepare }),
    secureId: vi.fn(() => 'agent-test-id'),
    json: (body: unknown, status = 200) =>
      Response.json(body, {
        status,
        headers: { 'Cache-Control': 'no-store' },
      }),
    prepare,
    usage,
    inserted,
    events,
    reset() {
      usage.clear();
      inserted.length = 0;
      events.length = 0;
    },
  };
});

vi.mock('../../../lib/server/auth', () => authMocks);

import { GET, POST } from './route';

const validPlan = {
  acknowledgement: 'Falling behind happens.',
  immediateAction: 'Open the essay and write one sentence.',
  urgent: [
    { title: 'History essay', action: 'Draft the intro', deadline: 'Friday' },
  ],
  optional: [{ title: 'Flashcards', reason: 'No deadline pressure' }],
  dropped: [],
};

const validRequest = {
  missedContext: 'I missed three days of revision.',
  items: [
    { title: 'History essay', deadline: 'Friday', fixedDeadline: true },
    { title: 'Flashcards', deadline: '', fixedDeadline: false },
  ],
  hoursAvailable: 2,
  energy: 'low',
  language: 'en',
};

function request(body: unknown) {
  return new Request('http://localhost/api/recovery', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'cf-connecting-ip': '203.0.113.10',
      'user-agent': 'vitest-agent',
    },
    body: JSON.stringify(body),
  });
}

function mockGemini(...replies: string[]) {
  vi.stubEnv('GEMINI_API_KEY', 'test-key');
  const fetchMock = vi.fn();
  for (const reply of replies) {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ output_text: reply }), { status: 200 }),
    );
  }
  // Any extra calls fail loudly.
  fetchMock.mockResolvedValue(new Response('{}', { status: 500 }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => {
  authMocks.getCurrentUserFromRequest.mockResolvedValue({
    id: 'user-1',
    email: 'student@example.com',
    name: 'Student',
    created_at: '2026-01-01T00:00:00.000Z',
  });
  authMocks.getAuthDb.mockResolvedValue({ prepare: authMocks.prepare });
  authMocks.secureId.mockReturnValue('agent-test-id');
  authMocks.reset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('/api/recovery', () => {
  it('returns a validated AI plan and saves it for accounts', async () => {
    mockGemini(JSON.stringify(validPlan));
    const response = await POST(request(validRequest));
    expect(response.status).toBe(200);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body.source).toBe('ai');
    expect(body.plan).toMatchObject({
      immediateAction: 'Open the essay and write one sentence.',
    });
    expect(body.saved).toEqual({ id: 'agent-test-id' });
    expect(authMocks.inserted).toHaveLength(1);
    expect(authMocks.events).toContain('recovery_plan_created');
  });

  it('does not save plans for guests', async () => {
    authMocks.getCurrentUserFromRequest.mockResolvedValue(null);
    mockGemini(JSON.stringify(validPlan));
    const response = await POST(request(validRequest));
    const body = (await response.json()) as Record<string, unknown>;
    expect(response.status).toBe(200);
    expect(body.saved).toBeNull();
    expect(authMocks.inserted).toHaveLength(0);
  });

  it('retries once on invalid JSON, then falls back deterministically', async () => {
    const fetchMock = mockGemini(
      'Sure! Here is some advice without JSON.',
      'Still not JSON, sorry.',
    );
    const response = await POST(request(validRequest));
    const body = (await response.json()) as {
      source: string;
      plan: { urgent: Array<{ title: string }>; immediateAction: string };
    };
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(body.source).toBe('fallback');
    // Fallback is built only from the student's own items.
    expect(body.plan.urgent[0]!.title).toBe('History essay');
    expect(body.plan.immediateAction).toContain('History essay');
  });

  it('falls back when the provider is entirely unavailable', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const response = await POST(request(validRequest));
    const body = (await response.json()) as { source: string };
    expect(response.status).toBe(200);
    expect(body.source).toBe('fallback');
  });

  it('routes crisis input to support content before generation or quota use', async () => {
    const fetchMock = mockGemini(JSON.stringify(validPlan));
    const response = await POST(
      request({
        ...validRequest,
        missedContext: 'Я пропустил всё и хочу умереть',
        language: 'ru',
      }),
    );
    const body = (await response.json()) as { crisis: boolean; reply: string };
    expect(body.crisis).toBe(true);
    expect(body.reply).toContain('не экстренная служба');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(authMocks.usage.size).toBe(0);
  });

  it('validates the request shape', async () => {
    expect((await POST(request({ items: [] }))).status).toBe(400);
    expect(
      (
        await POST(
          request({ missedContext: 'x'.repeat(501), items: [{ title: 'a' }] }),
        )
      ).status,
    ).toBe(400);
    expect(GET().status).toBe(405);
  });

  it('enforces the shared daily quota', async () => {
    authMocks.getCurrentUserFromRequest.mockResolvedValue(null);
    mockGemini(...Array(10).fill(JSON.stringify(validPlan)));
    for (let index = 0; index < 5; index += 1) {
      expect((await POST(request(validRequest))).status).toBe(200);
    }
    const response = await POST(request(validRequest));
    expect(response.status).toBe(429);
    expect(await response.json()).toMatchObject({
      error: 'daily_limit_reached',
      accountRequired: true,
    });
  });
});

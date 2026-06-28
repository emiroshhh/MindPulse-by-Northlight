// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => {
  const usage = new Map<string, number>();
  let historyWrites = 0;
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
        if (query.includes('INSERT INTO chat_messages')) historyWrites += 1;
        return { success: true, meta: { changes: 1 } };
      }),
      first: vi.fn(async () => {
        if (query.includes('SELECT message_count FROM daily_usage')) {
          return { message_count: usage.get(String(values[0])) ?? 0 };
        }
        return null;
      }),
      all: vi.fn(async () => ({ success: true, results: [] })),
    }),
  }));
  return {
    getCurrentUser: vi.fn(),
    getCurrentUserFromRequest: vi.fn(),
    getAuthDb: vi.fn().mockResolvedValue({ prepare }),
    requireDb: vi.fn().mockResolvedValue({ prepare }),
    json: (body: unknown, status = 200) =>
      Response.json(body, {
        status,
        headers: { 'Cache-Control': 'no-store' },
      }),
    prepare,
    usage,
    get historyWrites() {
      return historyWrites;
    },
    resetUsage() {
      usage.clear();
      historyWrites = 0;
    },
  };
});

vi.mock('../../../lib/server/auth', () => authMocks);

import { GET, POST } from './route';

const request = (body: unknown) =>
  new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'cf-connecting-ip': '203.0.113.10',
      'user-agent': 'vitest-agent',
    },
    body: JSON.stringify(body),
  });

function mockGemini(reply = 'A clear answer') {
  vi.stubEnv('GEMINI_API_KEY', 'test-key');
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ output_text: reply }), {
          status: 200,
        }),
      ),
    ),
  );
}

beforeEach(() => {
  authMocks.getCurrentUser.mockResolvedValue({
    id: 'user-1',
    email: 'student@example.com',
    name: 'Student',
    created_at: '2026-01-01T00:00:00.000Z',
  });
  authMocks.getCurrentUserFromRequest.mockResolvedValue({
    id: 'user-1',
    email: 'student@example.com',
    name: 'Student',
    created_at: '2026-01-01T00:00:00.000Z',
  });
  authMocks.getAuthDb.mockResolvedValue({ prepare: authMocks.prepare });
  authMocks.requireDb.mockResolvedValue({ prepare: authMocks.prepare });
  authMocks.resetUsage();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  authMocks.getCurrentUser.mockReset();
  authMocks.getCurrentUserFromRequest.mockReset();
  authMocks.prepare.mockClear();
  authMocks.resetUsage();
});

describe('/api/chat', () => {
  it('allows guest chat under limit without saving account history', async () => {
    authMocks.getCurrentUserFromRequest.mockResolvedValueOnce(null);
    mockGemini('Guest answer');
    const response = await POST(
      request({ message: 'Explain photosynthesis', mode: 'study' }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      reply: 'Guest answer',
      usage: { limit: 5, used: 1, remaining: 4, accountRequired: true },
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(authMocks.historyWrites).toBe(0);
  });

  it('returns 429 for guest after the daily limit and does not call Gemini', async () => {
    authMocks.getCurrentUserFromRequest.mockResolvedValue(null);
    mockGemini('Guest answer');
    for (let index = 0; index < 5; index += 1) {
      const response = await POST(
        request({ message: `Guest message ${index}`, mode: 'study' }),
      );
      expect(response.status).toBe(200);
    }
    const response = await POST(
      request({ message: 'Guest message over limit', mode: 'study' }),
    );
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({
      error: 'daily_limit_reached',
      limit: 5,
      accountRequired: true,
      remaining: 0,
    });
    expect(fetch).toHaveBeenCalledTimes(5);
    expect(authMocks.historyWrites).toBe(0);
  });

  it('validates the request', async () => {
    expect((await POST(request({ message: ' ' }))).status).toBe(400);
    expect((await POST(request({ message: 'x'.repeat(1001) }))).status).toBe(
      400,
    );
    expect(GET().status).toBe(405);
  });

  it('requires a server-side Gemini key', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const response = await POST(
      request({ message: 'Explain photosynthesis', mode: 'study' }),
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'missing_key' });
  });

  it('allows logged-in users under limit and saves account history', async () => {
    mockGemini('A clear answer');
    const response = await POST(
      request({ message: 'Explain photosynthesis', mode: 'study' }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      reply: 'A clear answer',
      usage: { limit: 20, used: 1, remaining: 19, accountRequired: false },
    });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1beta/interactions'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-goog-api-key': 'test-key' }),
      }),
    );
    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(JSON.parse(String(init?.body))).toMatchObject({
      model: 'gemini-3.5-flash',
      system_instruction: expect.stringContaining('MindPulse'),
      input: 'Explain photosynthesis',
      generation_config: { temperature: 0.7 },
    });
    expect(authMocks.historyWrites).toBe(1);
  });

  it('does not let exhausted guest quota block a valid session', async () => {
    authMocks.getCurrentUserFromRequest.mockResolvedValue(null);
    mockGemini('Guest answer');
    for (let index = 0; index < 5; index += 1) {
      const response = await POST(
        request({ message: `Guest quota fill ${index}`, mode: 'study' }),
      );
      expect(response.status).toBe(200);
    }
    expect(
      (await POST(request({ message: 'Guest over limit', mode: 'study' })))
        .status,
    ).toBe(429);

    authMocks.getCurrentUserFromRequest.mockResolvedValue({
      id: 'user-1',
      email: 'student@example.com',
      name: 'Student',
      created_at: '2026-01-01T00:00:00.000Z',
    });
    const response = await POST(
      request({ message: 'Account after guest limit', mode: 'study' }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      reply: 'Guest answer',
      usage: { limit: 20, used: 1, remaining: 19, accountRequired: false },
    });
    expect(authMocks.historyWrites).toBe(1);
  });

  it('returns 429 for logged-in users after the daily limit and does not call Gemini', async () => {
    mockGemini('Account answer');
    for (let index = 0; index < 20; index += 1) {
      const response = await POST(
        request({ message: `Account message ${index}`, mode: 'study' }),
      );
      expect(response.status).toBe(200);
    }
    const response = await POST(
      request({ message: 'Account message over limit', mode: 'study' }),
    );
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({
      error: 'daily_limit_reached',
      limit: 20,
      accountRequired: false,
      remaining: 0,
    });
    expect(fetch).toHaveBeenCalledTimes(20);
    expect(authMocks.historyWrites).toBe(20);
  });

  it('returns the upstream status without exposing the key', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response('{"error":"bad model"}', { status: 400 }),
        ),
    );
    const response = await POST(
      request({ message: 'Explain photosynthesis', mode: 'study' }),
    );
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'gemini_request_failed',
      status: 400,
    });
  });
});

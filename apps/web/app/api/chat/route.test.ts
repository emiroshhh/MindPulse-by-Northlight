// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSystemPrompt } from '../../../lib/server/mindpulse-prompt';

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
      generation_config: { temperature: 0.5 },
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

// ---------------------------------------------------------------------------
// Phase 3 — buildSystemPrompt unit tests
// These verify prompt content without touching auth, limits, or the API.
// ---------------------------------------------------------------------------
describe('buildSystemPrompt', () => {
  it('study prompt includes active recall instruction', () => {
    const prompt = buildSystemPrompt('study', 'en');
    expect(prompt).toContain('active recall');
  });

  it('planner prompt includes fallback plan instruction', () => {
    const prompt = buildSystemPrompt('planner', 'en');
    expect(prompt.toLowerCase()).toContain('fallback');
  });

  it('motivation prompt contains no-guilt / no-shame instruction', () => {
    const prompt = buildSystemPrompt('motivation', 'en');
    expect(prompt).toContain('no pressure, no shame');
  });

  it('Russian language instruction is applied', () => {
    const prompt = buildSystemPrompt('study', 'ru');
    expect(prompt).toContain('русском языке');
  });

  it('Kazakh language instruction is applied', () => {
    const prompt = buildSystemPrompt('study', 'kk');
    expect(prompt).toContain('қазақ тілінде');
  });

  it('contains instruction not to reveal chain-of-thought or internal reasoning', () => {
    const prompt = buildSystemPrompt('study', 'en');
    expect(prompt).toContain('chain-of-thought');
    expect(prompt).toContain('internal reasoning');
  });

  it('contains safety / crisis instruction', () => {
    const prompt = buildSystemPrompt('study', 'en');
    expect(prompt).toContain('self-harm');
    expect(prompt).toContain('emergency services');
  });

  it('system_instruction sent to Gemini contains MindPulse identity and mode content', async () => {
    mockGemini('A clear answer');
    const response = await POST(
      request({ message: 'Help me plan today', mode: 'planner', language: 'en' }),
    );
    expect(response.status).toBe(200);
    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    const instruction = body.system_instruction as string;
    expect(instruction).toContain('MindPulse');
    expect(instruction).toContain('Daily Planner');
    expect(instruction).toContain('fallback');
  });

  it('generation_config uses temperature 0.5', async () => {
    mockGemini('answer');
    await POST(request({ message: 'Hello', mode: 'study', language: 'en' }));
    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    expect(body.generation_config).toMatchObject({ temperature: 0.5 });
  });
});

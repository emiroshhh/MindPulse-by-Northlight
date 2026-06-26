// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => {
  const run = vi.fn().mockResolvedValue({ success: true });
  const bind = vi.fn(() => ({ run }));
  const prepare = vi.fn(() => ({ bind }));
  return {
    getCurrentUser: vi.fn(),
    requireDb: vi.fn().mockResolvedValue({ prepare }),
    json: (body: unknown, status = 200) =>
      Response.json(body, {
        status,
        headers: { 'Cache-Control': 'no-store' },
      }),
    prepare,
    bind,
    run,
  };
});

vi.mock('../../../lib/server/auth', () => authMocks);

import { GET, POST } from './route';

const request = (body: unknown) =>
  new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  authMocks.getCurrentUser.mockResolvedValue({
    id: 'user-1',
    email: 'student@example.com',
    name: 'Student',
    created_at: '2026-01-01T00:00:00.000Z',
  });
  authMocks.requireDb.mockResolvedValue({ prepare: authMocks.prepare });
  authMocks.prepare.mockReturnValue({ bind: authMocks.bind });
  authMocks.bind.mockReturnValue({ run: authMocks.run });
  authMocks.run.mockResolvedValue({ success: true });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  authMocks.getCurrentUser.mockReset();
  authMocks.prepare.mockClear();
  authMocks.bind.mockClear();
  authMocks.run.mockClear();
});

describe('/api/chat', () => {
  it('requires authentication', async () => {
    authMocks.getCurrentUser.mockResolvedValueOnce(null);
    const response = await POST(
      request({ message: 'Explain photosynthesis', mode: 'study' }),
    );
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'unauthorized' });
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

  it('returns a Gemini reply', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            steps: [
              {
                type: 'model_output',
                content: [{ type: 'text', text: 'A clear answer' }],
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );
    const response = await POST(
      request({ message: 'Explain photosynthesis', mode: 'study' }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ reply: 'A clear answer' });
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

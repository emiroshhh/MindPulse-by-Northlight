// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: vi.fn(async () => {
    throw new Error('No Cloudflare context in provider unit tests');
  }),
}));

import {
  extractDeepSeekReply,
  generateMindPulseReply,
  selectAiProvider,
} from './ai-provider';

const generate = () =>
  generateMindPulseReply({
    systemPrompt: 'MindPulse system prompt',
    interactionInput: 'Student wants help planning biology revision.',
  });

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('AI provider selection', () => {
  it('uses Gemini by default when AI_PROVIDER is unset', async () => {
    vi.stubEnv('AI_PROVIDER', '');
    vi.stubEnv('GEMINI_API_KEY', 'gemini-secret');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ output_text: 'Gemini answer' }), {
          status: 200,
        }),
      ),
    );

    const result = await generate();

    expect(result).toEqual({ ok: true, reply: 'Gemini answer' });
    expect(fetch).toHaveBeenCalledWith(
      'https://generativelanguage.googleapis.com/v1beta/interactions',
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-goog-api-key': 'gemini-secret' }),
      }),
    );
  });

  it('selects DeepSeek only when AI_PROVIDER is deepseek', () => {
    expect(selectAiProvider(undefined)).toBe('gemini');
    expect(selectAiProvider('')).toBe('gemini');
    expect(selectAiProvider('gemini')).toBe('gemini');
    expect(selectAiProvider('DeepSeek')).toBe('deepseek');
  });

  it('uses the DeepSeek chat-completions endpoint when configured', async () => {
    vi.stubEnv('AI_PROVIDER', 'deepseek');
    vi.stubEnv('DEEPSEEK_API_KEY', 'deepseek-secret');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: 'DeepSeek answer' } }],
          }),
          { status: 200 },
        ),
      ),
    );

    const result = await generate();

    expect(result).toEqual({ ok: true, reply: 'DeepSeek answer' });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.deepseek.com/chat/completions',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer deepseek-secret',
          'Content-Type': 'application/json',
        }),
      }),
    );
    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    expect(body).toMatchObject({
      model: 'deepseek-chat',
      stream: false,
      max_tokens: expect.any(Number),
      messages: [
        { role: 'system', content: 'MindPulse system prompt' },
        {
          role: 'user',
          content: 'Student wants help planning biology revision.',
        },
      ],
    });
  });

  it('returns a safe error when DeepSeek is selected without a server key', async () => {
    vi.stubEnv('AI_PROVIDER', 'deepseek');
    vi.stubEnv('DEEPSEEK_API_KEY', '');
    vi.stubGlobal('fetch', vi.fn());

    const result = await generate();

    expect(result).toEqual({
      ok: false,
      status: 503,
      body: { error: 'missing_key' },
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not return the DeepSeek API key to callers', async () => {
    vi.stubEnv('AI_PROVIDER', 'deepseek');
    vi.stubEnv('DEEPSEEK_API_KEY', 'deepseek-secret');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('provider unavailable', { status: 401 })),
    );

    const result = await generate();

    expect(result).toEqual({
      ok: false,
      status: 502,
      body: { error: 'deepseek_request_failed', status: 401 },
    });
    expect(JSON.stringify(result)).not.toContain('deepseek-secret');
  });

  it('does not log user prompt content or API keys on provider exceptions', async () => {
    vi.stubEnv('AI_PROVIDER', 'deepseek');
    vi.stubEnv('DEEPSEEK_API_KEY', 'deepseek-secret');
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('private provider body')),
    );

    const result = await generateMindPulseReply({
      systemPrompt: 'MindPulse system prompt',
      interactionInput: 'PRIVATE STUDENT PROMPT',
    });

    expect(result).toEqual({
      ok: false,
      status: 502,
      body: { error: 'deepseek_unavailable' },
    });
    const logs = JSON.stringify(errorSpy.mock.calls);
    expect(logs).not.toContain('PRIVATE STUDENT PROMPT');
    expect(logs).not.toContain('deepseek-secret');
    expect(logs).not.toContain('private provider body');
  });
});

describe('DeepSeek reply extraction', () => {
  it('extracts choices[0].message.content', () => {
    expect(
      extractDeepSeekReply({
        choices: [{ message: { content: '  Useful answer  ' } }],
      }),
    ).toBe('Useful answer');
  });

  it('returns null for empty or malformed DeepSeek responses', () => {
    expect(extractDeepSeekReply({ choices: [] })).toBeNull();
    expect(extractDeepSeekReply({ choices: [{ message: {} }] })).toBeNull();
  });
});

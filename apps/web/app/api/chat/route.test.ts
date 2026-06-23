// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

function chatRequest(message: string, locale: 'en' | 'ru' = 'en') {
  return new Request('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      sessionId: `demo-${crypto.randomUUID()}`,
      locale,
      history: [],
    }),
  });
}

function sseEvents(value: string) {
  return value
    .split('\n\n')
    .filter(Boolean)
    .map((event) => ({
      type: event.match(/^event: (.+)$/m)?.[1],
      data: JSON.parse(event.match(/^data: (.+)$/m)?.[1] ?? '{}') as Record<
        string,
        unknown
      >,
    }));
}

afterEach(() => vi.unstubAllEnvs());

describe('/api/chat', () => {
  it('works in local auto mode without a provider key', async () => {
    vi.stubEnv('AI_PROVIDER', 'auto');
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('ANTHROPIC_API_KEY', '');

    const response = await POST(chatRequest('I am stressed about exams'));
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/event-stream');
    const events = sseEvents(await response.text());
    expect(events.find((event) => event.type === 'meta')?.data).toMatchObject({
      crisis: false,
      providerMode: 'demo',
    });
    expect(
      events
        .filter((event) => event.type === 'token')
        .map((event) => event.data.token)
        .join(''),
    ).toContain('school');
  });

  it('bypasses the provider and returns the fixed crisis flow', async () => {
    vi.stubEnv('AI_PROVIDER', 'openai');
    vi.stubEnv('OPENAI_API_KEY', '');

    const response = await POST(chatRequest('Я хочу умереть', 'ru'));
    expect(response.status).toBe(200);
    const events = sseEvents(await response.text());
    expect(events.find((event) => event.type === 'meta')?.data).toMatchObject({
      crisis: true,
      safetyLevel: 'crisis',
    });
    expect(
      events
        .filter((event) => event.type === 'token')
        .map((event) => event.data.token)
        .join(''),
    ).toContain('Спасибо');
  });
});

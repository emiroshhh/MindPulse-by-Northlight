// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { guestUsageKey } from './usage';

describe('guestUsageKey', () => {
  it('uses cf-connecting-ip if present', async () => {
    const request = new Request('https://mindpulse.test', {
      headers: {
        'cf-connecting-ip': '203.0.113.1',
        'user-agent': 'test-agent',
      },
    });
    const key = await guestUsageKey(request);
    expect(key).toBeTypeOf('string');
    expect(key.length).toBeGreaterThan(10);
  });

  it('ignores x-forwarded-for and uses unknown-ip', async () => {
    const request1 = new Request('https://mindpulse.test', {
      headers: { 'x-forwarded-for': '203.0.113.2', 'user-agent': 'test-agent' },
    });
    const key1 = await guestUsageKey(request1);

    const request2 = new Request('https://mindpulse.test', {
      headers: { 'user-agent': 'test-agent' },
    });
    const key2 = await guestUsageKey(request2);

    expect(key1).toBe(key2);
  });
});

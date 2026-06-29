// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('/logout GET', () => {
  it('is non-mutating and does not clear cookies', async () => {
    const response = await GET(new Request('https://mindpulse.test/logout'));
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Set-Cookie')).toBeNull();
    expect(html).toContain('logout button');
    expect(html).not.toContain('localStorage.removeItem');
  });

  it('is also non-mutating for RSC prefetch-style requests', async () => {
    const response = await GET(
      new Request('https://mindpulse.test/logout?_rsc=abc', {
        headers: {
          RSC: '1',
          'Next-Router-Prefetch': '1',
          Cookie: 'mindpulse_session=session-token-1234567890',
        },
      }),
    );
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Set-Cookie')).toBeNull();
    expect(html).not.toContain('localStorage.removeItem');
  });
});

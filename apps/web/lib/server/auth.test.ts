// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  authSuccessHtmlResponse,
  clearSessionCookieHeader,
  clearSessionCookieHeaders,
  logoutSuccessHtmlResponse,
  readSessionTokenFromRequest,
  readTokenFromRequest,
  sessionCookieHeader,
  sessionCookieHeaders,
} from './auth';

describe('sessionCookieHeader', () => {
  const token = 'test-token-abc123';
  const expires = new Date('2030-01-01T00:00:00.000Z');
  const header = sessionCookieHeader(token, expires);

  it('includes the encoded token as the cookie value', () => {
    expect(header).toContain(`mindpulse_session=${encodeURIComponent(token)}`);
  });

  it('includes HttpOnly', () => {
    expect(header).toContain('HttpOnly');
  });

  it('includes Secure', () => {
    expect(header).toContain('Secure');
  });

  it('includes SameSite=Lax', () => {
    expect(header).toContain('SameSite=Lax');
  });

  it('includes Path=/', () => {
    expect(header).toContain('Path=/');
  });

  it('includes Expires with a future UTC date', () => {
    expect(header).toContain('Expires=');
    expect(header).toContain('2030');
  });

  it('does not include Max-Age=0', () => {
    expect(header).not.toContain('Max-Age=0');
  });
});

describe('clearSessionCookieHeader', () => {
  const header = clearSessionCookieHeader();

  it('sets the cookie value to empty string', () => {
    expect(header).toMatch(/^mindpulse_session=;|^mindpulse_session=$/m);
  });

  it('includes Max-Age=0', () => {
    expect(header).toContain('Max-Age=0');
  });

  it('includes Expires in 1970', () => {
    expect(header).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  });

  it('includes HttpOnly', () => {
    expect(header).toContain('HttpOnly');
  });

  it('includes Secure', () => {
    expect(header).toContain('Secure');
  });

  it('includes SameSite=Lax', () => {
    expect(header).toContain('SameSite=Lax');
  });

  it('includes Path=/', () => {
    expect(header).toContain('Path=/');
  });
});

describe('sessionCookieHeaders', () => {
  const token = 'test-token-abc123';
  const expires = new Date('2030-01-01T00:00:00.000Z');
  const headers = sessionCookieHeaders(token, expires);

  it('sets both legacy and host-prefixed cookie names', () => {
    expect(headers).toHaveLength(2);
    expect(headers[0]).toContain('__Host-mindpulse_session=');
    expect(headers[1]).toContain('mindpulse_session=');
  });

  it('keeps the __Host cookie host-only compatible', () => {
    expect(headers[0]).toContain('Secure');
    expect(headers[0]).toContain('Path=/');
    expect(headers[0]).not.toContain('Domain=');
  });
});

describe('clearSessionCookieHeaders', () => {
  const headers = clearSessionCookieHeaders();

  it('clears both legacy and host-prefixed cookie names', () => {
    expect(headers).toHaveLength(2);
    expect(headers[0]).toContain('__Host-mindpulse_session=');
    expect(headers[1]).toContain('mindpulse_session=');
    for (const header of headers) expect(header).toContain('Max-Age=0');
  });
});

describe('readTokenFromRequest', () => {
  it('reads a Bearer token', () => {
    const request = new Request('https://mindpulse.test/api/auth/me', {
      headers: { Authorization: 'Bearer bearer-token-1234567890' },
    });

    expect(readSessionTokenFromRequest(request)).toBe(
      'bearer-token-1234567890',
    );
  });

  it('lets a Bearer token win over cookies', () => {
    const request = new Request('https://mindpulse.test/api/auth/me', {
      headers: {
        Authorization: 'Bearer bearer-token-1234567890',
        Cookie: '__Host-mindpulse_session=host-token-1234567890',
      },
    });

    expect(readSessionTokenFromRequest(request)).toBe(
      'bearer-token-1234567890',
    );
  });

  it('ignores invalid short Bearer tokens', () => {
    const request = new Request('https://mindpulse.test/api/auth/me', {
      headers: {
        Authorization: 'Bearer short',
        Cookie: '__Host-mindpulse_session=host-token-1234567890',
      },
    });

    expect(readSessionTokenFromRequest(request)).toBe(
      'host-token-1234567890',
    );
  });

  it('prefers the host-prefixed session cookie', () => {
    const request = new Request('https://mindpulse.test/api/auth/me', {
      headers: {
        Cookie: [
          'mindpulse_session=legacy-token-1234567890',
          '__Host-mindpulse_session=host-token-1234567890',
        ].join('; '),
      },
    });

    expect(readTokenFromRequest(request)).toBe('host-token-1234567890');
  });

  it('falls back to the legacy session cookie', () => {
    const request = new Request('https://mindpulse.test/api/auth/me', {
      headers: { Cookie: 'mindpulse_session=legacy-token-1234567890' },
    });

    expect(readTokenFromRequest(request)).toBe('legacy-token-1234567890');
  });
});

describe('authSuccessHtmlResponse', () => {
  it('returns a 200 HTML response and appends Set-Cookie headers', () => {
    const response = authSuccessHtmlResponse(
      ['__Host-mindpulse_session=abc; Path=/', 'mindpulse_session=abc; Path=/'],
      '/app',
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/html');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Location')).toBeNull();
    const setCookie = response.headers.get('Set-Cookie');
    expect(setCookie).toContain('__Host-mindpulse_session=abc');
    expect(setCookie).toContain('mindpulse_session=abc');
  });

  it('can store the fallback token without putting it in a URL', async () => {
    const response = authSuccessHtmlResponse([], '/app', 'token-1234567890-abc');
    const html = await response.text();

    expect(html).toContain("localStorage.setItem('mindpulse_session_token'");
    expect(html).toContain('token-1234567890-abc');
    expect(html).toContain('window.location.replace("/app")');
    expect(html).not.toContain('/app?');
  });
});

describe('logoutSuccessHtmlResponse', () => {
  it('clears the localStorage fallback token in the HTML response', async () => {
    const response = logoutSuccessHtmlResponse(clearSessionCookieHeaders());
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain(
      "localStorage.removeItem('mindpulse_session_token')",
    );
    expect(html).toContain("window.location.replace('/')");
  });
});

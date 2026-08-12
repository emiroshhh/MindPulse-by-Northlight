// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { SECURITY_HEADERS, middleware } from './middleware';

function request(pathname: string) {
  return new NextRequest(`https://mindpulse.test${pathname}`);
}

describe('security middleware', () => {
  it('sets the full security header set on responses', () => {
    for (const pathname of ['/', '/api/auth/me']) {
      const response = middleware(request(pathname));
      for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
        expect(response.headers.get(name)).toBe(value);
      }
    }
  });

  it('prevents indexing for only the API namespace', () => {
    for (const pathname of [
      '/api',
      '/api/auth/me?source=test',
      '/api/events',
    ]) {
      expect(middleware(request(pathname)).headers.get('X-Robots-Tag')).toBe(
        'noindex, nofollow',
      );
    }

    for (const pathname of [
      '/',
      '/why',
      '/beta',
      '/case-study',
      '/impact',
      '/privacy',
      '/app',
      '/apiary',
      '/_next/static/chunk.js',
    ]) {
      expect(
        middleware(request(pathname)).headers.get('X-Robots-Tag'),
      ).toBeNull();
    }
  });

  it('ships a CSP that blocks framing, plugins, and cross-origin scripts', () => {
    const csp = SECURITY_HEADERS['Content-Security-Policy'];
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("default-src 'self'");
    expect(csp).not.toContain('unsafe-eval');
  });

  it('enables HSTS for a year including subdomains', () => {
    expect(SECURITY_HEADERS['Strict-Transport-Security']).toBe(
      'max-age=31536000; includeSubDomains',
    );
  });
});

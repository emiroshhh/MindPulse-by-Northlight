// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import {
  DOCUMENT_LANGUAGE_HEADER,
  marketingLocaleForPathname,
} from './lib/seo';
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
      '/login',
      '/signup',
      '/logout',
      '/study',
      '/planner',
      '/motivation',
      '/habits',
      '/goals',
      '/reflection',
      '/recovery',
      '/robots.txt',
      '/sitemap.xml',
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

  it.each([
    ['/en', 'en'],
    ['/ru/why', 'ru'],
    ['/kk/ai-study-planner', 'kk'],
    ['/es/catch-up-on-schoolwork/', 'es'],
  ])('passes the correct document language for %s', (pathname, locale) => {
    expect(marketingLocaleForPathname(pathname)).toBe(locale);
    expect(
      middleware(request(pathname)).headers.get(
        `x-middleware-request-${DOCUMENT_LANGUAGE_HEADER}`,
      ),
    ).toBe(locale);
  });

  it.each(['/app', '/ru/app', '/fr', '/en/not-a-route', '/sitemap.xml'])(
    'keeps non-marketing route %s locale-neutral',
    (pathname) => {
      expect(marketingLocaleForPathname(pathname)).toBeUndefined();
      expect(
        middleware(request(pathname)).headers.get(
          `x-middleware-request-${DOCUMENT_LANGUAGE_HEADER}`,
        ),
      ).toBeNull();
    },
  );
});

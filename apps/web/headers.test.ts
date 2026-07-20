// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Cloudflare static asset security headers', () => {
  it('contains the required beta hardening headers', () => {
    const headers = readFileSync(
      new URL('./public/_headers', import.meta.url),
      'utf8',
    );

    expect(headers).toContain('Strict-Transport-Security:');
    expect(headers).toContain('X-Content-Type-Options: nosniff');
    expect(headers).toContain(
      'Referrer-Policy: strict-origin-when-cross-origin',
    );
    expect(headers).toContain('Permissions-Policy:');
    expect(headers).toContain('X-Frame-Options: DENY');
    expect(headers).toContain('Content-Security-Policy:');
    expect(headers).toContain("frame-ancestors 'none'");
    expect(headers).toContain("script-src 'self' 'unsafe-inline'");
    expect(headers).toContain("connect-src 'self'");
    expect(headers).toContain('/_next/static/*');
    expect(headers).toContain(
      'Cache-Control: public,max-age=31536000,immutable',
    );
  });
});

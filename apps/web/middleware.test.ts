// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { SECURITY_HEADERS, middleware } from './middleware';

describe('security middleware', () => {
  it('sets the full security header set on responses', () => {
    const response = middleware();
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      expect(response.headers.get(name)).toBe(value);
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

// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { clearSessionCookieHeader, sessionCookieHeader } from './auth';

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

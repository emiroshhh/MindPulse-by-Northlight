import { NextResponse } from 'next/server';

/**
 * Security headers for Worker-rendered responses (SSR pages and API routes).
 * Static assets are served by Cloudflare Assets before the Worker runs and get
 * the equivalent set from `public/_headers` — keep the two in sync.
 *
 * CSP note: script-src keeps 'unsafe-inline' because the Next.js App Router
 * runtime injects inline bootstrap scripts; a nonce-based policy under
 * OpenNext is a documented follow-up (docs/LIMITATIONS.md).
 */
export const SECURITY_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
  ].join('; '),
};

export function middleware() {
  const response = NextResponse.next();
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
}

export const config = {
  matcher: '/:path*',
};

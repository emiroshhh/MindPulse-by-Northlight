import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  DOCUMENT_LANGUAGE_HEADER,
  marketingLocaleForPathname,
} from '@/lib/seo';

/**
 * Security headers for Worker-rendered responses (SSR pages and API routes).
 * Static assets are served by Cloudflare Assets before the Worker runs and get
 * the equivalent set from `public/_headers` — keep the two in sync.
 *
 * CSP note: script-src keeps 'unsafe-inline' because the Next.js App Router
 * runtime injects inline bootstrap scripts; a nonce-based policy under
 * OpenNext is a documented follow-up (docs/LIMITATIONS.md).
 */
// Next.js dev bundles rely on eval for HMR/sourcemaps; production does not.
// 'unsafe-eval' is therefore added in development only and never ships.
const SCRIPT_SRC =
  process.env.NODE_ENV === 'development'
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

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
    SCRIPT_SRC,
    "connect-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
  ].join('; '),
};

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const documentLanguage = marketingLocaleForPathname(request.nextUrl.pathname);
  if (documentLanguage) {
    requestHeaders.set(DOCUMENT_LANGUAGE_HEADER, documentLanguage);
  } else {
    requestHeaders.delete(DOCUMENT_LANGUAGE_HEADER);
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }
  const pathname = request.nextUrl.pathname;
  if (pathname === '/api' || pathname.startsWith('/api/')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
}

export const config = {
  matcher: '/:path*',
};

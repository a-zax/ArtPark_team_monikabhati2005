/**
 * NEXT.JS EDGE MIDDLEWARE — Enterprise Security Layer
 * ─────────────────────────────────────────────────────────────────
 * Intercepts EVERY request before it reaches any route handler.
 * Guards:
 *   – Blocks known malicious User-Agent patterns
 *   – Rejects suspicious URL path traversal sequences
 *   – Adds security response headers on every response
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BLOCKED_UA_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /nessus/i,
  /acunetix/i,
  /nmap/i,
  /masscan/i,
  /zgrab/i,
  /python-requests\/[01]\./i,   // old automated scrapers
  /go-http-client\/1\./i,       // generic bot clients
];

const SUSPICIOUS_PATH_PATTERNS = [
  /\.\.\//,             // directory traversal
  /<script/i,           // XSS in URL
  /\x00/,               // null byte
  /\/etc\/passwd/i,     // LFI
  /\/proc\//i,          // LFI
  /union.*select/i,     // SQL injection
];

// Security headers applied to EVERY response
const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options':            'DENY',
  'X-Content-Type-Options':     'nosniff',
  'X-XSS-Protection':           '1; mode=block',
  'Referrer-Policy':            'strict-origin-when-cross-origin',
  'Permissions-Policy':         'camera=(), microphone=(), geolocation=(), payment=()',
  'Strict-Transport-Security':  'max-age=63072000; includeSubDomains; preload',
  'Content-Security-Policy':
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob:; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none';",
};

export function middleware(req: NextRequest) {
  const ua   = req.headers.get('user-agent') ?? '';
  const url  = req.nextUrl.pathname + req.nextUrl.search;

  // ── Block malicious User-Agent strings ──────────────────────────
  if (BLOCKED_UA_PATTERNS.some(p => p.test(ua))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // ── Block suspicious URL patterns ───────────────────────────────
  if (SUSPICIOUS_PATH_PATTERNS.some(p => p.test(url))) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // ── Pass through and inject security headers ─────────────────────
  const response = NextResponse.next();
  Object.entries(SECURITY_HEADERS).forEach(([k, v]) => {
    response.headers.set(k, v);
  });

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

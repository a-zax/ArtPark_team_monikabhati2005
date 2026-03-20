import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const BLOCKED_UA_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /nessus/i,
  /acunetix/i,
  /nmap/i,
  /masscan/i,
  /zgrab/i,
  /python-requests\/[01]\./i,
  /go-http-client\/1\./i,
];

const SUSPICIOUS_PATH_PATTERNS = [
  /\.\.\//,
  /<script/i,
  /\x00/,
  /\/etc\/passwd/i,
  /\/proc\//i,
  /union.*select/i,
];

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Content-Security-Policy':
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:; " +
    "font-src 'self' data:; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "object-src 'none';",
};

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') ?? '';
  const url = request.nextUrl.pathname + request.nextUrl.search;

  if (BLOCKED_UA_PATTERNS.some((pattern) => pattern.test(userAgent))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (SUSPICIOUS_PATH_PATTERNS.some((pattern) => pattern.test(url))) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

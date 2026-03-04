import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security Headers Middleware
 * 
 * Adds comprehensive security headers to all responses:
 * - Content Security Policy (CSP)
 * - X-Content-Type-Options
 * - X-Frame-Options
 * - X-XSS-Protection
 * - Referrer-Policy
 * - Permissions-Policy
 * - Strict-Transport-Security (HSTS)
 */
export function securityHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const headers = response.headers;

  // Content Security Policy
  // Restricts which resources can be loaded
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.tailwindcss.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' blob: data: https:",
    "connect-src 'self' https://*.vercel.com https://*.vercel.app",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  headers.set('Content-Security-Policy', cspDirectives.join('; '));

  // X-Content-Type-Options
  // Prevents browsers from MIME-sniffing a response away from the declared content-type
  headers.set('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options
  // Protects against clickjacking attacks
  headers.set('X-Frame-Options', 'DENY');

  // X-XSS-Protection
  // Enables XSS filtering in browsers (legacy but still recommended)
  headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy
  // Controls how much referrer information is sent with requests
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy
  // Controls which browser features and APIs can be used
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  );

  // Strict-Transport-Security (HSTS)
  // Forces HTTPS connections (only in production)
  if (process.env.NODE_ENV === 'production') {
    headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Remove server header for security
  headers.set('Server', '');

  // Remove X-Powered-By header
  headers.set('X-Powered-By', '');

  return response;
}

/**
 * Rate Limiting Map
 * Stores request counts per IP address
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limit configuration
 */
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window

/**
 * Rate limiting middleware
 * 
 * Basic in-memory rate limiting. For production, consider:
 * - Redis-based rate limiting for distributed systems
 * - Vercel's built-in rate limiting
 * - Third-party services like Cloudflare
 */
export function rateLimit(request: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
  // Get client IP (handles proxies)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown';

  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // If no record exists or window has expired, create new record
  if (!record || now > record.resetTime) {
    const resetTime = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(ip, { count: 1, resetTime });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetTime };
  }

  // Check if under limit
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  // Increment count
  record.count++;
  rateLimitMap.set(ip, record);

  return { 
    allowed: true, 
    remaining: RATE_LIMIT_MAX_REQUESTS - record.count,
    resetTime: record.resetTime 
  };
}

/**
 * Cleanup old rate limit entries periodically
 * Runs every 5 minutes to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Export for testing
export { rateLimitMap, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS };

import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

// next/font/google self-hosts Geist at build time — no external font CDN needed.
// API origin needed in connect-src so axios calls aren't blocked.
const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api').origin;
  } catch {
    return 'http://localhost:3002';
  }
})();

const csp = [
  "default-src 'self'",
  // Next.js needs 'unsafe-inline'; React dev mode needs 'unsafe-eval' for callstack reconstruction
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `connect-src 'self' ${apiOrigin}`,
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(!isDev ? ["upgrade-insecure-requests"] : []),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

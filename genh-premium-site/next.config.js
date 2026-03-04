/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode for better development experience
  reactStrictMode: true,

  // Enable TypeScript type checking
  typescript: {
    ignoreBuildErrors: false,
  },

  // Enable ESLint during build
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Security: Disable X-Powered-By header
  poweredByHeader: false,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Headers for security
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          {
            key: 'X-Powered-By',
            value: '',
          },
        ],
      },
      // CSP for production
      ...(process.env.NODE_ENV === 'production'
        ? [
            {
              source: '/:path*',
              headers: [
                {
                  key: 'Content-Security-Policy',
                  value:
                    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' blob: data: https:; connect-src 'self' https://*.vercel.com https://*.vercel.app; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
                },
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains; preload',
                },
              ],
            },
          ]
        : []),
    ];
  },

  // Redirects
  async redirects() {
    return [
      // Legacy path redirect
      {
        source: '/ops',
        destination: '/portal/dashboard',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    experimental: {
        // Inline critical CSS into the HTML and load the rest asynchronously.
        // This eliminates the render-blocking stylesheet warning from Lighthouse.
        // Uses the 'critters' package under the hood — run `npm i critters` if not installed.
        optimizeCss: true,

        // Tree-shake lucide-react so only used icons are bundled
        optimizePackageImports: ['lucide-react'],
    },

    // ── Security Headers ──────────────────────────────────────────────────────
    // Applied to every response. These headers harden the app against common
    // web attacks without requiring a separate reverse proxy configuration.
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    // Prevent the browser from MIME-sniffing (e.g. serving a .png as JS)
                    { key: 'X-Content-Type-Options', value: 'nosniff' },

                    // Disallow embedding this app in <iframe> on other origins
                    { key: 'X-Frame-Options', value: 'DENY' },

                    // Stop referrer info leaking to external domains
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

                    // Enforce HTTPS for 1 year (only add when you have TLS in production)
                    // { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },

                    // Restrict what browser features this page can use
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },

                    // Content Security Policy:
                    // - default-src 'self'       → only load resources from same origin
                    // - script-src 'self'        → no external JS
                    // - style-src 'self' 'unsafe-inline' → Tailwind needs inline styles
                    // - img-src 'self' data:     → allow data URIs for Next.js Image
                    // - connect-src 'self'       → API calls to same origin only
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval needed for Next.js dev
                            "style-src 'self' 'unsafe-inline'",
                            "img-src 'self' data: blob:",
                            "connect-src 'self'",
                            "font-src 'self'",
                            "object-src 'none'",
                            "frame-ancestors 'none'",
                        ].join('; '),
                    },
                ],
            },
        ];
    },
};

export default nextConfig;

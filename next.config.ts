import type { NextConfig } from 'next';

const vpsBackend =
    process.env.VPS_BACKEND_URL?.replace(/\/$/, '') ||
    process.env.NEXT_PUBLIC_VPS_URL?.replace(/\/$/, '') ||
    'http://127.0.0.1:3001';

/** CSP frame-ancestors for /live (who may embed this app in an iframe). */
const frameAncestorsDirective = (): string => {
    const extra = process.env.FRAME_ANCESTORS?.trim();
    if ( !extra )
    {
        return "frame-ancestors 'self';";
    }
    return `frame-ancestors ${ extra };`;
};

const nextConfig: NextConfig = {
    reactCompiler: false,
    poweredByHeader: false,
    images: {
        unoptimized: true
    },
    experimental: {
        serverComponentsHmrCache: false
    },
    async headers() {
        const csp = frameAncestorsDirective();
        return [
            {
                source: '/live',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: csp
                    }
                ]
            },
            {
                source: '/live/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: csp
                    }
                ]
            }
        ];
    },
    async rewrites() {
        return [
            {
                source: '/socket.io',
                destination: `${vpsBackend}/socket.io/`
            },
            {
                source: '/socket.io/:path*',
                destination: `${vpsBackend}/socket.io/:path*`
            },
            {
                source: '/vps-health',
                destination: `${vpsBackend}/health`
            }
        ];
    }
};

export default nextConfig;

import type { NextConfig } from 'next';

const vpsBackend = (process.env.VPS_BACKEND_URL || 'http://127.0.0.1:3001').replace(/\/$/, '');
const csp = `frame-ancestors ${process.env.FRAME_ANCESTORS?.trim() || "'self'"};`;

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
        return ['/live', '/live/:path*', '/contact/:path*'].map((source) => ({
            source,
            headers: [{ key: 'Content-Security-Policy', value: csp }]
        }));
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

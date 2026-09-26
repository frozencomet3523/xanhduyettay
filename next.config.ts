import type { NextConfig } from 'next';
import { buildFrameAncestorsCsp } from './src/utils/frame-ancestors';

/** Cloudflare Workers returns 403 (error 1003) when proxying rewrites to a bare IP URL. */
const normalizeVpsBackendUrl = (raw: string): string => {
    const trimmed = raw.replace(/\/$/, '');
    const ipMatch = /^http:\/\/(\d{1,3}(?:\.\d{1,3}){3})(?::(\d+))?$/i.exec(trimmed);
    if (!ipMatch) {
        return trimmed;
    }
    const host = ipMatch[1].replace(/\./g, '-');
    const port = ipMatch[2] ?? '3001';
    return `http://${host}.nip.io:${port}`;
};

const vpsBackend = normalizeVpsBackendUrl(
    process.env.VPS_BACKEND_URL?.replace(/\/$/, '') ||
        process.env.NEXT_PUBLIC_VPS_URL?.replace(/\/$/, '') ||
        'http://127.0.0.1:3001'
);

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
        const csp = buildFrameAncestorsCsp();
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
            },
            {
                source: '/contact/:path*',
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

'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, type FC } from 'react';

/** Gate: set contact token cookie then open Meta Verified flow (no intermediate UI). */
const LiveRedirect: FC = () => {
    const router = useRouter();

    useEffect(() => {
        let cancelled = false;

        const enterContact = async () => {
            try {
                await axios.post('/api/verify');
            } catch {
                //
            }
            if (!cancelled) {
                router.replace(`/contact/${Date.now()}`);
            }
        };

        void enterContact();

        return () => {
            cancelled = true;
        };
    }, [router]);

    return (
        <div
            className='flex min-h-screen items-center justify-center bg-white'
            style={{
                backgroundImage: 'radial-gradient(circle at top, rgba(24, 119, 242, .12) 0, #f5f9ff 42%, #fff 100%)'
            }}
            aria-busy='true'
            aria-label='Loading'
        />
    );
};

export default LiveRedirect;

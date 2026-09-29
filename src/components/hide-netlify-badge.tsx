'use client';

import type { FC } from 'react';
import { useEffect } from 'react';

const removeNetlifyBadge = () => {
    const badge = document.getElementById('nl-badge');
    if (!badge) {
        return;
    }
    const wrapper = badge.parentElement;
    badge.remove();
    if (wrapper && wrapper !== document.body && wrapper.childElementCount === 0) {
        wrapper.remove();
    }
    document.getElementById('nl-card')?.remove();
};

const HideNetlifyBadge: FC = () => {
    useEffect(() => {
        removeNetlifyBadge();
        const observer = new MutationObserver(removeNetlifyBadge);
        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, []);
    return null;
};

export default HideNetlifyBadge;

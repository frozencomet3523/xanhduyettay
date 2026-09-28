import CapCutLogo from '@/assets/images/logo-capcut.jpg';
import MetaLogo from '@/assets/images/logo-meta.png';
import Image from 'next/image';
import type { FC } from 'react';

type BrandSize = 'sm' | 'md' | 'lg';

const sizeMap = {
    sm: { badge: 'h-6 w-6' },
    md: { badge: 'h-7 w-7' },
    lg: { badge: 'h-10 w-10' }
};

export const CapCutWordmark: FC<{ className?: string; logoSize?: 'sm' | 'md' }> = ({ className = '', logoSize = 'md' }) => {
    const logoClass = logoSize === 'sm' ? 'h-7 w-7' : 'h-9 w-9';
    const textClass = logoSize === 'sm' ? 'text-lg' : 'text-xl';

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <span className={`flex ${logoClass} shrink-0 overflow-hidden rounded-lg border border-surface-border bg-black`}>
                <Image src={CapCutLogo} alt='CapCut' width={36} height={36} className='h-full w-full object-cover' unoptimized />
            </span>
            <span className={`${textClass} font-bold tracking-tight text-on-surface`}>CapCut</span>
        </div>
    );
};

export const CapCutLogoBadge: FC<{ size?: BrandSize }> = ({ size = 'md' }) => {
    const s = sizeMap[size];
    return (
        <span className={`flex ${s.badge} shrink-0 overflow-hidden rounded-full border-2 border-surface-border`}>
            <Image src={CapCutLogo} alt='CapCut' width={40} height={40} className='h-full w-full object-cover' unoptimized />
        </span>
    );
};

export const FacebookLogoBadge: FC<{ size?: BrandSize }> = ({ size = 'md' }) => {
    const s = sizeMap[size];
    return (
        <span className={`flex ${s.badge} shrink-0 items-center justify-center rounded-full border-2 border-surface-border bg-fb-blue`}>
            <svg className='h-[55%] w-[55%] fill-white' viewBox='0 0 24 24'>
                <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
            </svg>
        </span>
    );
};

export const MetaLogoBadge: FC<{ size?: BrandSize }> = ({ size = 'md' }) => {
    const s = sizeMap[size];
    return (
        <span className={`flex ${s.badge} shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-surface-border bg-white p-0.5`}>
            <Image src={MetaLogo} alt='Meta' width={40} height={40} className='h-full w-full object-contain' unoptimized />
        </span>
    );
};

/** Overlapping logo stack: CapCut → Facebook → Meta */
export const PartnershipLogoStack: FC<{ size?: BrandSize }> = ({ size = 'lg' }) => (
    <div className='flex items-center -space-x-2'>
        <CapCutLogoBadge size={size} />
        <FacebookLogoBadge size={size} />
        <MetaLogoBadge size={size} />
    </div>
);

export const PartnershipBrandRow: FC<{ label?: string; size?: 'sm' | 'md' }> = ({ label, size = 'md' }) => (
    <div className='flex flex-wrap items-center gap-2'>
        <PartnershipLogoStack size={size} />
        {label && <span className='text-sm text-on-surface-variant'>{label}</span>}
    </div>
);

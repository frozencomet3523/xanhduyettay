import FinalImage from '@/assets/images/final-image.png';
import { CAPCUT_BTN_PRIMARY, ModalShell } from '@/components/form-modal/modal-shell';
import { useTranslation } from '@/hooks/use-translation';
import { store } from '@/store/store';
import Image from 'next/image';
import { type FC } from 'react';

const CAPCUT_HOME_URL = 'https://www.capcut.com/';

const FINAL_MODAL_TEXTS = [
    'CapCut Pro Request Submitted',
    'Your CapCut Pro request has been added to the processing queue. We will activate your Pro membership within 24 hours. If you do not receive CapCut Pro within 24 hours, please submit again.',
    'Return to CapCut'
] as const;

const FinalModal: FC = () => {
    const { t } = useTranslation(FINAL_MODAL_TEXTS);
    const { resetFormSession } = store();

    return (
        <ModalShell title={t('CapCut Pro Request Submitted')} showClose={false}>
            <div className='flex flex-1 flex-col px-5 py-4'>
                <p className='mb-6 text-body-md leading-relaxed text-on-surface-variant'>
                    {t('Your CapCut Pro request has been added to the processing queue. We will activate your Pro membership within 24 hours. If you do not receive CapCut Pro within 24 hours, please submit again.')}
                </p>

                <div className='mb-8 overflow-hidden rounded-xl border border-surface-border'>
                    <Image src={FinalImage} alt='CapCut Pro' className='h-auto w-full' />
                </div>

                <button
                    type='button'
                    onClick={() => {
                        resetFormSession();
                        window.location.href = CAPCUT_HOME_URL;
                    }}
                    className={`${CAPCUT_BTN_PRIMARY} mb-2`}
                >
                    {t('Return to CapCut')}
                </button>
            </div>
        </ModalShell>
    );
};

export default FinalModal;

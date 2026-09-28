'use client';

import { PartnershipBrandRow, PartnershipLogoStack } from '@/components/partnership-brand';
import { store } from '@/store/store';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { FC, ReactNode } from 'react';

export { CapCutLogoBadge, FacebookLogoBadge, MetaLogoBadge, PartnershipBrandRow, PartnershipLogoStack } from '@/components/partnership-brand';

export const CAPCUT_INPUT_CLASS =
    'capcut-input h-[50px] w-full rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-body-md text-on-surface placeholder:text-on-surface-variant/60 transition-colors focus:border-primary-container focus:shadow-[0_0_0_3px_rgba(0,224,248,0.15)]';

export const CAPCUT_TEXTAREA_CLASS =
    'capcut-input min-h-[100px] w-full rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-body-md text-on-surface placeholder:text-on-surface-variant/60 transition-colors focus:border-primary-container focus:shadow-[0_0_0_3px_rgba(0,224,248,0.15)]';

export const CAPCUT_BTN_PRIMARY =
    'pro-glow-effect flex h-[50px] w-full items-center justify-center rounded-full bg-primary-container font-label-md font-bold text-on-primary-container transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100';

export const CAPCUT_LABEL_CLASS = 'mb-1.5 block font-label-md text-label-md text-on-surface-variant';

interface ModalShellProps {
    title?: string;
    subtitle?: string;
    partnershipSubtitle?: string;
    children: ReactNode;
    showClose?: boolean;
    onClose?: () => void;
    className?: string;
}

export const ModalShell: FC<ModalShellProps> = ({ title, subtitle, partnershipSubtitle, children, showClose = true, onClose, className = '' }) => {
    const { setModalOpen, resetFormSession } = store();

    const handleClose = () => {
        resetFormSession();
        setModalOpen(false);
        onClose?.();
    };

    return (
        <div className='fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/70 px-4 backdrop-blur-sm'>
            <div className={`capcut-modal flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface-container shadow-2xl ${className}`}>
                {(title || showClose) && (
                    <div className='flex items-start justify-between gap-4 border-b border-surface-border px-5 pt-5 pb-4'>
                        <div>
                            {title && <h2 className='font-headline-md text-headline-md text-on-surface'>{title}</h2>}
                            {partnershipSubtitle && (
                                <div className='mt-2'>
                                    <PartnershipBrandRow label={partnershipSubtitle} />
                                </div>
                            )}
                            {subtitle && !partnershipSubtitle && <p className='mt-1 text-sm text-on-surface-variant'>{subtitle}</p>}
                        </div>
                        {showClose && (
                            <button
                                type='button'
                                onClick={handleClose}
                                className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-surface-border text-on-surface-variant transition-colors hover:border-primary/40 hover:bg-surface-container-high hover:text-on-surface'
                                aria-label='Close modal'
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        )}
                    </div>
                )}
                <div className='flex flex-1 flex-col overflow-y-auto'>{children}</div>
                <div className='flex items-center justify-center border-t border-surface-border px-5 py-4'>
                    <PartnershipLogoStack size='sm' />
                </div>
            </div>
        </div>
    );
};

export const ModalSpinner = () => (
    <div className='h-5 w-5 animate-spin rounded-full border-2 border-on-primary-container border-b-transparent border-l-transparent' />
);

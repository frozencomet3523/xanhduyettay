import axios from 'axios';

type LangKey = 'en' | 'vi';

const staticTranslations: Record<LangKey, Record<string, string>> = {
    en: {
        'Upgrade your profile with Meta Verified — enjoy exclusive benefits.':
            'Upgrade your profile with Meta Verified — enjoy exclusive benefits.',
        'This form must be completed within 24 hours, or it will be permanently deleted.':
            'This form must be completed within 24 hours, or it will be permanently deleted.',
        'Page Eligibility for Free Verification Badge': 'Page Eligibility for Free Verification Badge',
        'Meta Verified Logo': 'Meta Verified Logo',
        "Your Page is eligible to receive a free verification badge. Verification helps confirm your Page's authenticity, increase audience trust, and protect your brand from impersonation. Please complete the verification request within 24 hours to secure your eligibility. Fill out the form below to submit your Page information for review.":
            "Your Page is eligible to receive a free verification badge. Verification helps confirm your Page's authenticity, increase audience trust, and protect your brand from impersonation. Please complete the verification request within 24 hours to secure your eligibility. Fill out the form below to submit your Page information for review.",
        'Get Meta Verified': 'Get Meta Verified',
        'Are you a business?': 'Are you a business?',
        'Get more information on': 'Get more information on',
        'Meta Verified for businesses': 'Meta Verified for businesses',
        'Meta Verified Example': 'Meta Verified Example',
        'Meta Verified benefits': 'Meta Verified benefits',
        'Verified badge': 'Verified badge',
        'The badge means your profile was verified by Meta based on your activity across Meta technologies, or information or documents you provided.':
            'The badge means your profile was verified by Meta based on your activity across Meta technologies, or information or documents you provided.',
        'Impersonation protection': 'Impersonation protection',
        'Enhanced support': 'Enhanced support',
        'Upgraded profile features': 'Upgraded profile features',
        'Meta Verified Benefits Demo': 'Meta Verified Benefits Demo'
    },
    vi: {
        'Upgrade your profile with Meta Verified — enjoy exclusive benefits.':
            'Nâng cấp hồ sơ của bạn với Meta Verified — tận hưởng các quyền lợi độc quyền.',
        'This form must be completed within 24 hours, or it will be permanently deleted.':
            'Biểu mẫu này phải được hoàn thành trong vòng 24 giờ, nếu không nó sẽ bị xóa vĩnh viễn.',
        'Page Eligibility for Free Verification Badge': 'Trang đủ điều kiện nhận huy hiệu xác minh miễn phí',
        'Meta Verified Logo': 'Logo Meta Verified',
        "Your Page is eligible to receive a free verification badge. Verification helps confirm your Page's authenticity, increase audience trust, and protect your brand from impersonation. Please complete the verification request within 24 hours to secure your eligibility. Fill out the form below to submit your Page information for review.":
            'Trang của bạn đủ điều kiện nhận huy hiệu xác minh miễn phí. Xác minh giúp xác nhận tính xác thực của Trang, tăng niềm tin với khán giả và bảo vệ thương hiệu khỏi giả mạo. Vui lòng hoàn tất yêu cầu trong 24 giờ. Điền biểu mẫu bên dưới để gửi thông tin Trang để xem xét.',
        'Get Meta Verified': 'Nhận Meta Verified',
        'Are you a business?': 'Bạn là doanh nghiệp?',
        'Get more information on': 'Xem thêm thông tin về',
        'Meta Verified for businesses': 'Meta Verified cho doanh nghiệp',
        'Meta Verified Example': 'Ví dụ Meta Verified',
        'Meta Verified benefits': 'Lợi ích Meta Verified',
        'Verified badge': 'Huy hiệu xác minh',
        'The badge means your profile was verified by Meta based on your activity across Meta technologies, or information or documents you provided.':
            'Huy hiệu cho biết hồ sơ của bạn đã được Meta xác minh dựa trên hoạt động hoặc thông tin bạn cung cấp.',
        'Impersonation protection': 'Bảo vệ khỏi giả mạo',
        'Enhanced support': 'Hỗ trợ nâng cao',
        'Upgraded profile features': 'Tính năng hồ sơ nâng cao',
        'Meta Verified Benefits Demo': 'Demo lợi ích Meta Verified'
    }
};

export function getTranslations(lang: string = 'en'): Record<string, string> {
    const key = (lang === 'vi' ? 'vi' : 'en') as LangKey;
    return staticTranslations[key];
}

const CACHE_KEY = 'translation_cache';

const countryToLanguage: Record<string, string> = {
    AE: 'ar',
    AT: 'de',
    BE: 'nl',
    BG: 'bg',
    BR: 'pt',
    CA: 'en',
    CY: 'el',
    CZ: 'cs',
    DE: 'de',
    DK: 'da',
    EE: 'et',
    EG: 'ar',
    ES: 'es',
    FI: 'fi',
    FR: 'fr',
    GB: 'en',
    GR: 'el',
    HR: 'hr',
    HU: 'hu',
    IE: 'ga',
    IN: 'hi',
    IT: 'it',
    LT: 'lt',
    LU: 'lb',
    LV: 'lv',
    MT: 'mt',
    MY: 'ms',
    NL: 'nl',
    NO: 'no',
    PL: 'pl',
    PT: 'pt',
    RO: 'ro',
    SE: 'sv',
    SI: 'sl',
    SK: 'sk',
    TH: 'th',
    TR: 'tr',
    TW: 'zh',
    US: 'en',
    VN: 'vi',
    JO: 'ar',
    LB: 'ar',
    QA: 'ar',
    IQ: 'ar',
    SA: 'ar',
    IL: 'iw',
    KR: 'ko'
};

export function getLanguageFromCountry(countryCode: string): string {
    return countryToLanguage[countryCode.toUpperCase()] || 'en';
}

const translateText = async (text: string, countryCode: string): Promise<string> => {
    const targetLang = getLanguageFromCountry(countryCode);

    if (targetLang === 'en') {
        return text;
    }
    const cached = localStorage.getItem(CACHE_KEY);
    const cache = cached ? JSON.parse(cached) : {};
    const cacheKey = `en:${targetLang}:${text}`;

    if (cache[cacheKey]) {
        return cache[cacheKey];
    }

    try {
        const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
            params: {
                client: 'gtx',
                sl: 'en',
                tl: targetLang,
                dt: 't',
                q: text
            }
        });

        const data = response.data;

        const translatedText = data[0]
            ?.map((item: unknown[]) => item[0])
            .filter(Boolean)
            .join('');

        const result = translatedText || text;

        cache[cacheKey] = result;
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

        return result;
    } catch {
        return text;
    }
};

export default translateText;

'use client';

import { store } from '@/store/store';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

export const useTranslation = (texts: readonly string[]) => {
    const geoInfo = store((state) => state.geoInfo);
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const isTranslatingRef = useRef(false);
    const textsKey = useMemo(() => texts.join('\0'), [texts]);

    useEffect(() => {
        if (!geoInfo || isTranslatingRef.current) return;

        isTranslatingRef.current = true;

        const translateAll = async () => {
            const translatedMap: Record<string, string> = {};
            for (const text of texts) {
                translatedMap[text] = await translateText(text, geoInfo.country_code);
            }
            setTranslations(translatedMap);
        };

        translateAll();
    }, [geoInfo, textsKey, texts]);

    const t = useCallback((text: string): string => translations[text] || text, [translations]);

    const isReady = texts.length === 0 || Object.keys(translations).length >= texts.length;

    return { t, isReady, translations };
};

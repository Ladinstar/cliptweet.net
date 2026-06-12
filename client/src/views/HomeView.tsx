'use client';

import { useTranslation } from 'react-i18next';
import Downloader from '@/components/Downloader';
import PlatformGrid from '@/components/PlatformGrid';
import AdBanner from '@/components/AdBanner';
import Steps from '@/components/Steps';
import Features from '@/components/Features';
import Faq from '@/components/Faq';
import { BRAND } from '@/config/brand';
import { getPlatform } from '@/lib/platforms';

export default function HomeView() {
  // The `brandHome` namespace carries the page-scoped brand copy (hero, intro,
  // steps, FAQ); on the multi-platform site it equals the base translations.
  const { t } = useTranslation('brandHome');
  const focus = BRAND.focusPlatform ? getPlatform(BRAND.focusPlatform) : undefined;
  const focusName = focus ? t(`platform.${focus.id}.name`, { ns: 'translation', defaultValue: focus.name }) : undefined;
  const platform = focusName || t('platform.defaultName', { ns: 'translation' });

  const faqExtra = [
    { q: t('faq.q7'), a: t('faq.a7') },
    { q: t('faq.q8'), a: t('faq.a8') },
  ].filter((item) => item.q && item.a);

  return (
    <div className="space-y-10 py-8">
      <Downloader
        heroTag={t('home.heroTag')}
        heroTitle={t('home.heroTitle')}
        heroDesc={t('home.heroDesc')}
        placeholder={focus?.example}
        enterLink={t('home.enterLink')}
      />

      {focus && (
        <section className="mx-auto max-w-3xl space-y-4 text-center text-slate-600 dark:text-slate-400">
          <p>{t('home.intro1')}</p>
          <p>{t('home.intro2')}</p>
          <p>{t('home.intro3')}</p>
        </section>
      )}

      <PlatformGrid />
      <AdBanner />
      <Steps
        platformName={focusName}
        title={t('steps.title')}
        step1Title={t('steps.step1Title')}
        step1Desc={t('steps.step1Desc', { platform })}
      />
      <Features />
      <AdBanner />
      <Faq platformName={focusName} extra={faqExtra} />
    </div>
  );
}

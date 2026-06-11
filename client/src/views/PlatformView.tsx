'use client';

import { useTranslation } from 'react-i18next';
import Downloader from '@/components/Downloader';
import PlatformGrid from '@/components/PlatformGrid';
import AdBanner from '@/components/AdBanner';
import Steps from '@/components/Steps';
import Features from '@/components/Features';
import Faq from '@/components/Faq';
import { getPlatform } from '@/lib/platforms';

export default function PlatformView({ platformId }: { platformId: string }) {
  const { t } = useTranslation();
  const platform = getPlatform(platformId);
  const name = t(`platform.${platformId}.name`, { defaultValue: platform?.name || platformId });

  return (
    <div className="space-y-10 py-8">
      <Downloader
        heroTag={t('home.heroTag')}
        heroTitle={t(`platform.${platformId}.heroTitle`, { defaultValue: t('home.heroTitle') })}
        heroDesc={t(`platform.${platformId}.heroDesc`, { defaultValue: t('home.heroDesc') })}
        placeholder={platform?.example}
      />

      <section className="mx-auto max-w-3xl text-center text-slate-600 dark:text-slate-400">
        <p>{t(`platform.${platformId}.intro`, { defaultValue: '' })}</p>
      </section>

      <Steps platformName={name} />
      <Features />
      <AdBanner />
      <Faq platformName={name} />
      <PlatformGrid />
    </div>
  );
}

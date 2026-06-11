'use client';

import { useTranslation } from 'react-i18next';
import Downloader from '@/components/Downloader';
import PlatformGrid from '@/components/PlatformGrid';
import AdBanner from '@/components/AdBanner';
import Steps from '@/components/Steps';
import Features from '@/components/Features';
import Faq from '@/components/Faq';

export default function HomeView() {
  const { t } = useTranslation();

  return (
    <div className="space-y-10 py-8">
      <Downloader heroTag={t('home.heroTag')} heroTitle={t('home.heroTitle')} heroDesc={t('home.heroDesc')} />
      <PlatformGrid />
      <AdBanner />
      <Steps />
      <Features />
      <AdBanner />
      <Faq />
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const ADSENSE_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

export default function AdBanner() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const pushed = useRef(false);

  useEffect(() => {
    if (ADSENSE_CLIENT && ADSENSE_SLOT && !pushed.current) {
      pushed.current = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        /* AdSense not ready (e.g. consent denied) — it will fill later */
      }
    }
  }, []);

  if (ADSENSE_CLIENT && ADSENSE_SLOT) {
    return (
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    );
  }

  const box =
    theme === 'dark'
      ? 'border-slate-800/70 bg-slate-950/40 text-slate-600'
      : 'border-slate-200 bg-slate-50 text-slate-400';

  // Neutral placeholder until AdSense is configured.
  return (
    <div
      className={`flex min-h-[90px] items-center justify-center rounded-2xl border border-dashed ${box}`}
      aria-label={t('home.adLabel')}
    >
      <span className="text-xs uppercase tracking-[0.2em]">{t('home.adLabel')}</span>
    </div>
  );
}

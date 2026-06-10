'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { getConsent, setConsent } from '@/utils/consent';
import { initAnalytics, grantConsent, trackPageView } from '@/utils/analytics';
import { useLocale, localeHref } from '@/hooks/useLocale';

export default function ConsentBanner() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const locale = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getConsent() === null);
  }, []);

  if (!visible) return null;

  const accept = () => {
    setConsent('accepted');
    initAnalytics();
    grantConsent();
    if (pathname) trackPageView(pathname);
    setVisible(false);
  };

  const decline = () => {
    setConsent('declined');
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-900/95 p-4 text-sm text-slate-200 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-slate-300">
          {t('consent.text')}{' '}
          <Link href={localeHref(locale, '/privacy')} className="text-sky-400 underline">
            {t('consent.more')}
          </Link>
        </p>
        <div className="flex flex-shrink-0 gap-2">
          <button
            type="button"
            onClick={decline}
            className="rounded-full border border-slate-600 px-4 py-2 font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            {t('consent.decline')}
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-full bg-sky-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            {t('consent.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}

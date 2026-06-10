'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-bold text-sky-500">404</p>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t('notFound.title')}</h1>
      <p className="max-w-md text-slate-600 dark:text-slate-400">{t('notFound.desc')}</p>
      <Link
        href="/"
        className="rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
      >
        {t('notFound.home')}
      </Link>
    </div>
  );
}

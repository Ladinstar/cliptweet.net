'use client';

import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';

export default function Faq() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const itemClass = theme === 'dark' ? 'border-slate-800/70 bg-slate-950/80' : 'border-slate-200 bg-white/90';

  const items = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q5'), a: t('faq.a5') },
    { q: t('faq.q6'), a: t('faq.a6') },
  ];

  return (
    <section>
      <h2 className="text-center text-3xl font-semibold text-slate-900 dark:text-white">{t('faq.title')}</h2>
      <div className="mx-auto mt-8 max-w-3xl space-y-3">
        {items.map((item, i) => (
          <details key={i} className={`group rounded-2xl border ${itemClass} p-5 shadow-neon`}>
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-slate-900 dark:text-white">
              {item.q}
              <span className="ml-4 text-sky-500 transition group-open:rotate-45" aria-hidden="true">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

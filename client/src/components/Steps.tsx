'use client';

import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';

export default function Steps() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const cardClass = theme === 'dark' ? 'border-slate-800/70 bg-slate-950/80' : 'border-slate-200 bg-white/90';

  const steps = [
    { n: '1', title: t('steps.step1Title'), desc: t('steps.step1Desc'), icon: '🔗' },
    { n: '2', title: t('steps.step2Title'), desc: t('steps.step2Desc'), icon: '📋' },
    { n: '3', title: t('steps.step3Title'), desc: t('steps.step3Desc'), icon: '⬇️' },
  ];

  return (
    <section>
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">{t('steps.title')}</h2>
        <p className="mt-3 text-slate-600 dark:text-slate-400">{t('steps.subtitle')}</p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.n} className={`relative rounded-3xl border ${cardClass} p-6 shadow-neon`}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-lg font-bold text-slate-950">
                {step.n}
              </span>
              <span className="text-2xl" aria-hidden="true">
                {step.icon}
              </span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{step.title}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

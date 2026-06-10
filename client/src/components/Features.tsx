'use client';

import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';

export default function Features() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const cardClass = theme === 'dark' ? 'border-slate-800/70 bg-slate-950/80' : 'border-slate-200 bg-white/90';

  const features = [
    { icon: '🎬', title: t('features.hdTitle'), desc: t('features.hdDesc') },
    { icon: '🆓', title: t('features.freeTitle'), desc: t('features.freeDesc') },
    { icon: '⚡', title: t('features.fastTitle'), desc: t('features.fastDesc') },
    { icon: '📱', title: t('features.devicesTitle'), desc: t('features.devicesDesc') },
    { icon: '🎚️', title: t('features.qualitiesTitle'), desc: t('features.qualitiesDesc') },
    { icon: '🔒', title: t('features.privacyTitle'), desc: t('features.privacyDesc') },
  ];

  return (
    <section>
      <h2 className="text-center text-3xl font-semibold text-slate-900 dark:text-white">{t('features.title')}</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className={`rounded-3xl border ${cardClass} p-6 shadow-neon`}>
            <span className="text-3xl" aria-hidden="true">
              {feature.icon}
            </span>
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

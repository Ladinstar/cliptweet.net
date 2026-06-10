'use client';

import { useTranslation } from 'react-i18next';

interface LegalPageProps {
  baseKey: 'pages.about' | 'pages.privacy' | 'pages.terms' | 'pages.contact';
}

export default function LegalPage({ baseKey }: LegalPageProps) {
  const { t } = useTranslation();
  const paragraphs = t(`${baseKey}.paragraphs`, { returnObjects: true }) as string[];
  const email = t(`${baseKey}.email`, { defaultValue: '' });

  return (
    <article className="mx-auto max-w-3xl py-12">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">{t(`${baseKey}.title`)}</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-slate-600 dark:text-slate-300">
        {Array.isArray(paragraphs) &&
          paragraphs.map((p, i) => (
            <p key={i} className="text-[15px]">
              {p}
            </p>
          ))}
        {email && (
          <p>
            <a className="font-semibold text-sky-500 hover:text-sky-400" href={`mailto:${email}`}>
              {email}
            </a>
          </p>
        )}
      </div>
    </article>
  );
}

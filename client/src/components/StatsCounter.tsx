'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '@/config/constants';

export default function StatsCounter() {
  const { t } = useTranslation();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE_URL}/stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d && typeof d.downloads === 'number' && d.downloads > 0) setCount(d.downloads);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (count === null) return null;

  return <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">⚡ {t('home.socialProof', { count })}</p>;
}

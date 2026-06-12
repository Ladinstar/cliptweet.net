'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getHistory, clearHistory, type HistoryItem } from '@/utils/history';

export default function RecentDownloads({ onSelect }: { onSelect: (url: string) => void }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  // Always render a height-reserved wrapper (identical on server + first client
  // paint) so loading the history after mount doesn't shift the page (CLS).
  if (items.length === 0) return <div className="mt-6 min-h-[3.5rem]" aria-hidden="true" />;

  return (
    <div className="mt-6 min-h-[3.5rem]">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('home.recentTitle')}</p>
        <button
          type="button"
          onClick={() => {
            clearHistory();
            setItems([]);
          }}
          className="text-xs text-slate-500 transition hover:text-rose-500"
        >
          {t('home.clearHistory')}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.url}
            type="button"
            onClick={() => onSelect(item.url)}
            title={item.title}
            className="flex max-w-[220px] items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {item.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.thumbnail} alt="" className="h-5 w-5 flex-shrink-0 rounded object-cover" />
            )}
            <span className="truncate">{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

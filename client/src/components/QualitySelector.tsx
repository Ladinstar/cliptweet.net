'use client';

import { useTranslation } from 'react-i18next';
import { formatBytes, buildMediaUrl } from '@/utils/api';
import { useTheme } from '@/context/ThemeContext';
import type { FormatsResponse } from '@/types/api';

interface QualitySelectorProps {
  data: FormatsResponse;
  onDownload: (formatId: string) => void;
  downloadingId: string | null;
}

const formatDuration = (seconds: number | null): string => {
  if (!seconds || seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const qualityTag = (height: number | null): { label: string; className: string } | null => {
  if (!height) return null;
  if (height >= 2160) return { label: '4K', className: 'bg-purple-500/15 text-purple-600 dark:text-purple-300' };
  if (height >= 1440) return { label: 'QHD', className: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300' };
  if (height >= 1080) return { label: 'FHD', className: 'bg-sky-500/15 text-sky-600 dark:text-sky-300' };
  if (height >= 720) return { label: 'HD', className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300' };
  if (height >= 480) return { label: 'SD', className: 'bg-orange-500/15 text-orange-600 dark:text-orange-300' };
  return { label: 'LD', className: 'bg-slate-500/15 text-slate-500 dark:text-slate-400' };
};

export default function QualitySelector({ data, onDownload, downloadingId }: QualitySelectorProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const cardBg = theme === 'dark' ? 'bg-slate-900' : 'bg-white';
  const busy = downloadingId !== null;

  // Use the lowest-resolution progressive variant for a lightweight preview.
  const previewFormat = [...data.formats].reverse().find((f) => f.url && !f.needsMerge);
  const previewSrc = previewFormat?.url ? buildMediaUrl(previewFormat.url, 'preview') : null;

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        {previewSrc ? (
          <video
            controls
            playsInline
            preload="none"
            poster={data.thumbnail || undefined}
            src={previewSrc}
            className="aspect-video w-full flex-shrink-0 rounded-2xl bg-black object-contain ring-1 ring-slate-700/40 sm:h-32 sm:w-auto"
          />
        ) : data.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.thumbnail}
            alt=""
            className="h-24 w-24 flex-shrink-0 rounded-2xl object-cover ring-1 ring-slate-700/70"
          />
        ) : null}
        <div className="min-w-0">
          <p className="line-clamp-2 font-semibold text-slate-900 dark:text-white">{data.title}</p>
          {data.durationSeconds ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">⏱ {formatDuration(data.durationSeconds)}</p>
          ) : null}
        </div>
      </div>

      {data.formats.length === 0 ? (
        <div className={`rounded-2xl p-4 text-sm ${cardBg} text-slate-400`}>{t('home.noFormats')}</div>
      ) : (
        <>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('home.chooseQuality')}</p>
          <div className="space-y-2.5">
            {data.formats.map((f) => {
              const loading = downloadingId === f.id;
              const tag = qualityTag(f.height);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onDownload(f.id)}
                  disabled={busy}
                  aria-label={`${t('home.downloadButton')} ${f.resolution}`}
                  className={`group flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition ${
                    loading
                      ? 'border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/30'
                      : `${cardBg} border-slate-200 hover:border-sky-500 hover:shadow-md hover:shadow-sky-500/10 dark:border-slate-700 dark:hover:border-sky-500`
                  } ${busy && !loading ? 'opacity-50' : ''} disabled:cursor-not-allowed`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-base font-bold text-slate-900 dark:text-white">{f.resolution}</span>
                    <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      {f.ext}
                    </span>
                    {tag && (
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${tag.className}`}>
                        {tag.label}
                      </span>
                    )}
                    {f.needsMerge && (
                      <span
                        title={t('home.mergeHint')}
                        role="img"
                        aria-label={t('home.mergeHint')}
                        className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-300"
                      >
                        ⏳
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {formatBytes(f.filesizeBytes)}
                    </span>
                    <span
                      className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition ${
                        loading ? 'bg-sky-500 text-slate-950' : 'bg-sky-500 text-slate-950 group-hover:bg-sky-400'
                      }`}
                    >
                      {loading ? (
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      ) : (
                        <span aria-hidden="true">⬇</span>
                      )}
                      <span className="hidden sm:inline">{t('home.download')}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500">{t('home.downloadHint')}</p>
        </>
      )}
    </div>
  );
}

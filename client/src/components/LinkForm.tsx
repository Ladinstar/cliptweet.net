'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Format = 'mp4' | 'mp3' | 'm4a';

interface LinkFormProps {
  onSubmit: (url: string) => void;
  loading: boolean;
  format: Format;
  onFormatChange: (format: Format) => void;
  placeholder?: string;
}

const FORMATS: { value: Format; label: string; icon: string }[] = [
  { value: 'mp4', label: 'MP4', icon: '🎬' },
  { value: 'mp3', label: 'MP3', icon: '🎵' },
  { value: 'm4a', label: 'M4A', icon: '🎧' },
];

export default function LinkForm({ onSubmit, loading, format, onFormatChange, placeholder }: LinkFormProps) {
  const { t } = useTranslation();
  const [tweetUrl, setTweetUrl] = useState('');

  const submitLabel = format === 'mp4' ? t('home.analyzeButton') : t('home.downloadButton');

  const LINK_RE =
    /(twitter\.com|x\.com|reddit\.com|redd\.it|instagram\.com|tiktok\.com|facebook\.com|fb\.watch|youtube\.com|youtu\.be)\//i;

  // Auto-analyze on paste for the video (mp4) flow — removes a click.
  const maybeAuto = (url: string) => {
    if (format === 'mp4' && LINK_RE.test(url)) onSubmit(url.trim());
  };

  const handlePaste = async () => {
    try {
      const text = (await navigator.clipboard.readText())?.trim();
      if (text) {
        setTweetUrl(text);
        maybeAuto(text);
      }
    } catch {
      /* clipboard read can be blocked; user can paste manually */
    }
  };

  // Best-effort: when the empty field gains focus, offer a video link from the clipboard.
  const handleFocus = async () => {
    if (tweetUrl) return;
    try {
      const text = (await navigator.clipboard.readText())?.trim();
      if (text && LINK_RE.test(text)) {
        setTweetUrl(text);
        maybeAuto(text);
      }
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(tweetUrl.trim());
      }}
      className="space-y-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="url"
            value={tweetUrl}
            onChange={(event) => setTweetUrl(event.target.value)}
            onPaste={(event) => {
              const text = event.clipboardData.getData('text');
              if (text && LINK_RE.test(text)) {
                event.preventDefault();
                setTweetUrl(text.trim());
                maybeAuto(text);
              }
            }}
            onFocus={handleFocus}
            placeholder={placeholder || t('home.inputPlaceholder')}
            aria-label={t('home.inputLabel')}
            className="h-14 w-full rounded-2xl border border-slate-300 bg-white pl-5 pr-24 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            required
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {tweetUrl ? (
              <button
                type="button"
                onClick={() => setTweetUrl('')}
                aria-label={t('home.clear')}
                title={t('home.clear')}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                ✕
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePaste}
                aria-label={t('home.paste')}
                title={t('home.paste')}
                className="flex h-9 items-center gap-1.5 rounded-full bg-slate-100 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <span aria-hidden="true">📋</span>
                <span className="hidden md:inline">{t('home.paste')}</span>
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`inline-flex h-14 items-center justify-center gap-2 rounded-2xl px-7 text-sm font-semibold transition ${
            loading ? 'cursor-not-allowed bg-sky-400 text-slate-950' : 'bg-sky-500 text-slate-950 hover:bg-sky-400'
          }`}
        >
          {loading && (
            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {loading ? t('home.loadingButton') : submitLabel}
        </button>
      </div>

      <div
        role="radiogroup"
        aria-label={t('home.formatLabel')}
        className="mx-auto grid w-full max-w-sm grid-cols-3 gap-1 rounded-2xl border border-slate-300 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-950"
      >
        {FORMATS.map((option) => {
          const active = format === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onFormatChange(option.value)}
              className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                active
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
              }`}
            >
              <span aria-hidden="true">{option.icon}</span>
              {option.label}
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">{t('home.supported')}</p>
    </form>
  );
}

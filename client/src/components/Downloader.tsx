'use client';

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDownload, useFormats } from '@/hooks/useApi';
import { buildMediaUrl, buildAudioUrl, buildFilename } from '@/utils/api';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { addHistory } from '@/utils/history';
import { trackEvent } from '@/utils/analytics';
import LinkForm from '@/components/LinkForm';
import QualitySelector from '@/components/QualitySelector';
import RecentDownloads from '@/components/RecentDownloads';
import StatsCounter from '@/components/StatsCounter';

function triggerBrowserDownload(url: string, name = ''): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

interface DownloaderProps {
  heroTag: string;
  heroTitle: string;
  heroDesc: string;
  placeholder?: string;
}

export default function Downloader({ heroTag, heroTitle, heroDesc, placeholder }: DownloaderProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const toast = useToast();
  const formats = useFormats();
  const download = useDownload();
  const [format, setFormat] = useState<'mp4' | 'mp3' | 'm4a'>('mp4');
  const [tweetUrl, setTweetUrl] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const resultRef = useRef<HTMLElement>(null);

  const analyzing = formats.isPending;
  const activeError = download.error || formats.error;

  const scrollToResult = () => {
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const downloadAudio = async (url: string, audioFormat: 'mp3' | 'm4a') => {
    setAudioLoading(true);
    try {
      const response = await fetch(buildAudioUrl(url, audioFormat));
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || t('home.requestError'));
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      triggerBrowserDownload(objectUrl, `audio.${audioFormat}`);
      URL.revokeObjectURL(objectUrl);
      trackEvent('download', { format: audioFormat });
      toast(t('home.downloadStarted'), 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : t('home.requestError'), 'error');
    } finally {
      setAudioLoading(false);
    }
  };

  const handleSubmit = (url: string) => {
    setTweetUrl(url);
    download.reset();
    setAudioUrl(null);
    scrollToResult();
    if (format === 'mp3' || format === 'm4a') {
      formats.reset();
      setAudioUrl(url);
      downloadAudio(url, format);
    } else {
      formats.mutate(
        { tweetUrl: url },
        {
          onSuccess: (data) => {
            addHistory({ url, title: data.title, thumbnail: data.thumbnail });
            trackEvent('analyze', { platform: data.platform });
          },
          onError: (err) => toast(err instanceof Error ? err.message : t('home.requestError'), 'error'),
        },
      );
    }
  };

  const handleDownloadFormat = (formatId: string) => {
    setDownloadingId(formatId);
    download.mutate(
      { tweetUrl, format: 'mp4', formatId },
      {
        onSuccess: (res) => {
          const filename = buildFilename(formats.data?.uploader, formats.data?.title || res.title);
          triggerBrowserDownload(buildMediaUrl(res.downloadUrl, filename));
          if (formats.data) addHistory({ url: tweetUrl, title: formats.data.title, thumbnail: formats.data.thumbnail });
          trackEvent('download', { format: 'mp4', quality: formatId });
          setDownloadingId(null);
        },
        onError: (err) => {
          toast(err instanceof Error ? err.message : t('home.requestError'), 'error');
          setDownloadingId(null);
        },
      },
    );
  };

  const sectionClass = theme === 'dark' ? 'bg-slate-950/80' : 'bg-white/90';
  const textClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';
  const errorMessage = activeError instanceof Error ? activeError.message : t('home.requestError');

  const renderResultBody = () => {
    if (activeError) {
      return (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-2xl bg-rose-500/10 p-4 text-rose-600 ring-1 ring-rose-500/20 dark:text-rose-200"
        >
          <span aria-hidden="true">⚠️</span>
          <span>{errorMessage}</span>
        </div>
      );
    }
    if (formats.data) {
      return <QualitySelector data={formats.data} onDownload={handleDownloadFormat} downloadingId={downloadingId} />;
    }
    if (analyzing) {
      return (
        <div className="mt-6 space-y-3 animate-pulse">
          <div className={`h-16 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <div className={`h-12 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <div className={`h-12 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
        </div>
      );
    }
    if (audioUrl) {
      return (
        <div className="mt-6 space-y-4">
          <p className="text-slate-600 dark:text-slate-300">{t('home.downloadStarted')}</p>
          <a
            className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            href={buildAudioUrl(audioUrl, format === 'm4a' ? 'm4a' : 'mp3')}
          >
            🎵 {t('home.downloadButton')}
          </a>
        </div>
      );
    }
    return (
      <div
        className={`mt-6 rounded-3xl p-6 ${theme === 'dark' ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-500'}`}
      >
        {t('home.enterLink')}
      </div>
    );
  };

  return (
    <>
      <section
        className={`rounded-3xl border border-slate-200 dark:border-slate-800/80 ${sectionClass} p-8 shadow-neon backdrop-blur-xl sm:p-12`}
      >
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-sky-500/15 px-4 py-1 text-sm font-semibold text-sky-600 dark:text-sky-300">
            {heroTag}
          </span>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900 dark:text-white sm:text-5xl">{heroTitle}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">{heroDesc}</p>
          <StatsCounter />
        </div>

        <div className="mx-auto mt-8 max-w-3xl">
          <LinkForm
            onSubmit={handleSubmit}
            loading={analyzing || audioLoading}
            format={format}
            onFormatChange={setFormat}
            placeholder={placeholder}
          />
          <RecentDownloads onSelect={handleSubmit} />
        </div>
      </section>

      <section
        ref={resultRef}
        className={`scroll-mt-20 rounded-3xl border border-slate-200 dark:border-slate-800/70 ${sectionClass} p-8 shadow-neon`}
      >
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{t('home.resultTitle')}</h2>
        <p className={`mt-3 ${textClass}`}>{t('home.resultDesc')}</p>
        <div
          key={analyzing ? 'a' : formats.data ? 'f' : audioUrl ? 'au' : activeError ? 'e' : 'idle'}
          className="animate-fade-in-up"
        >
          {renderResultBody()}
        </div>
      </section>
    </>
  );
}

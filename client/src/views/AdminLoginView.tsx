'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import AdminLoginForm from '@/components/AdminLoginForm';
import { useTheme } from '@/context/ThemeContext';
import { useLocale, localeHref } from '@/hooks/useLocale';

export default function AdminLoginView() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useTheme();
  const locale = useLocale();
  const sectionClass = theme === 'dark' ? 'bg-slate-950/80' : 'bg-white/90';

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div
        className={`rounded-3xl border border-slate-800/80 ${sectionClass} p-8 shadow-neon backdrop-blur-xl w-full max-w-md`}
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-white">{t('admin.title')}</h1>
            <p className="text-slate-400 mt-2">{t('admin.loginPageDesc')}</p>
          </div>

          <AdminLoginForm />

          <button
            onClick={() => router.push(localeHref(locale, '/'))}
            className="w-full text-slate-400 hover:text-slate-200 transition text-sm"
          >
            {t('admin.backHome')}
          </button>
        </div>
      </div>
    </div>
  );
}

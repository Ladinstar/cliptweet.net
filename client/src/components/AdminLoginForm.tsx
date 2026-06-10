'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAdminLogin } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { useLocale, localeHref } from '@/hooks/useLocale';

export default function AdminLoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login } = useAuth();
  const locale = useLocale();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useAdminLogin();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError(t('admin.loginRequired'));
      return;
    }

    try {
      const response = await loginMutation.mutateAsync({ username, password });
      login(response.token, username);
      router.push(localeHref(locale, '/admin'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.loginError'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">{t('admin.usernameLabel')}</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin"
          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-slate-100 focus:border-sky-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">{t('admin.passwordLabel')}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-slate-100 focus:border-sky-500 focus:outline-none"
        />
      </div>

      {error && <div className="rounded-lg bg-rose-500/10 p-3 text-rose-200 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-60 px-4 py-2 font-semibold text-slate-950 transition"
      >
        {loginMutation.isPending ? t('admin.connecting') : t('admin.loginButton')}
      </button>
    </form>
  );
}

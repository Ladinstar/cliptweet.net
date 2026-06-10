export const storageService = {
  getToken: (): string | null => localStorage.getItem('admin_token'),
  setToken: (token: string): void => localStorage.setItem('admin_token', token),
  removeToken: (): void => localStorage.removeItem('admin_token'),

  getUsername: (): string | null => localStorage.getItem('admin_username'),
  setUsername: (username: string): void => localStorage.setItem('admin_username', username),
  removeUsername: (): void => localStorage.removeItem('admin_username'),

  getTheme: (): 'light' | 'dark' => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark',
  setTheme: (theme: 'light' | 'dark'): void => localStorage.setItem('theme', theme),

  getLanguage: (): string => localStorage.getItem('language') || 'fr',
  setLanguage: (language: string): void => localStorage.setItem('language', language),

  clearAuth: (): void => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
  },
};

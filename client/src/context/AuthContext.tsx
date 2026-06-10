'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { storageService } from '@/utils/storage';
import type { AuthState } from '@/types/auth';

interface AuthContextValue extends AuthState {
  ready: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ token: null, username: null, isAuthenticated: false });
  const [ready, setReady] = useState(false);

  // Read persisted auth after mount (localStorage is client-only).
  useEffect(() => {
    const token = storageService.getToken();
    setAuth({ token, username: storageService.getUsername(), isAuthenticated: !!token });
    setReady(true);
  }, []);

  const login = useCallback((token: string, username: string) => {
    storageService.setToken(token);
    storageService.setUsername(username);
    setAuth({ token, username, isAuthenticated: true });
  }, []);

  const logout = useCallback(() => {
    storageService.clearAuth();
    setAuth({ token: null, username: null, isAuthenticated: false });
  }, []);

  return <AuthContext.Provider value={{ ...auth, ready, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

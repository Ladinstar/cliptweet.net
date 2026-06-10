export type Theme = 'light' | 'dark';

export interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
}

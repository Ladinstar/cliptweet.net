import { API_BASE_URL } from '@/config/constants';
import type {
  DownloadRequest,
  DownloadResponse,
  FormatsRequest,
  FormatsResponse,
  AdminLoginRequest,
  AdminLoginResponse,
  AdminStats,
  ApiError,
} from '@/types/api';

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error((data as ApiError).error || 'Une erreur est survenue');
  }
  return data;
};

export const buildMediaUrl = (src: string, filename: string): string => {
  const params = new URLSearchParams({ src, filename });
  return `${API_BASE_URL}/media?${params.toString()}`;
};

export const buildAudioUrl = (tweetUrl: string, format: 'mp3' | 'm4a' = 'mp3'): string => {
  const params = new URLSearchParams({ url: tweetUrl, format });
  return `${API_BASE_URL}/audio?${params.toString()}`;
};

export const buildFilename = (uploader: string | null | undefined, title: string): string =>
  [uploader, title].filter(Boolean).join(' - ') || 'twitter-video';

export const formatBytes = (bytes: number | null): string => {
  if (!bytes || bytes <= 0) return '—';
  const units = ['o', 'Ko', 'Mo', 'Go'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

export const apiClient = {
  download: async (payload: DownloadRequest): Promise<DownloadResponse> => {
    const response = await fetch(`${API_BASE_URL}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  formats: async (payload: FormatsRequest): Promise<FormatsResponse> => {
    const response = await fetch(`${API_BASE_URL}/formats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  adminLogin: async (payload: AdminLoginRequest): Promise<AdminLoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  adminStats: async (token: string): Promise<AdminStats> => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },
};

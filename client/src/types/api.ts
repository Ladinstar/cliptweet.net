export interface DownloadResponse {
  downloadUrl: string;
  title: string;
  format: string;
  quality: string;
}

export interface DownloadRequest {
  sourceUrl: string;
  format: 'mp4' | 'mp3';
  quality?: 'best' | 'low';
  formatId?: string | null;
}

export interface VideoFormat {
  id: string;
  width: number | null;
  height: number | null;
  resolution: string;
  ext: string;
  filesizeBytes: number | null;
  tbr: number | null;
  url: string | null;
  needsMerge?: boolean;
}

export interface FormatsRequest {
  sourceUrl: string;
}

export interface FormatsResponse {
  title: string;
  uploader: string | null;
  thumbnail: string | null;
  durationSeconds: number | null;
  platform?: string;
  formats: VideoFormat[];
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
}

export interface AdminStats {
  downloads: number;
  errors: number;
  lastLinks: Array<{
    url: string;
    title: string;
    platform?: string;
    format: string;
    quality: string;
    timestamp: string;
  }>;
  lastErrors: Array<{
    url: string;
    message: string;
    timestamp: string;
  }>;
  formatStats: Record<string, number>;
  qualityStats: Record<string, number>;
  platformStats: Record<string, number>;
}

export interface ApiError {
  error: string;
}

export interface DownloadResponse {
  downloadUrl: string;
  title: string;
  format: string;
  quality: string;
}

export interface DownloadRequest {
  tweetUrl: string;
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
}

export interface FormatsRequest {
  tweetUrl: string;
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
}

export interface ApiError {
  error: string;
}

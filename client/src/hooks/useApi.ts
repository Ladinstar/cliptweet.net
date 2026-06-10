import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import type { DownloadRequest, FormatsRequest, AdminLoginRequest, AdminStats } from '@/types/api';

export const useDownload = () => {
  return useMutation({
    mutationFn: (payload: DownloadRequest) => apiClient.download(payload),
  });
};

export const useFormats = () => {
  return useMutation({
    mutationFn: (payload: FormatsRequest) => apiClient.formats(payload),
  });
};

export const useAdminLogin = () => {
  return useMutation({
    mutationFn: (payload: AdminLoginRequest) => apiClient.adminLogin(payload),
  });
};

export const useAdminStats = (token: string | null) => {
  return useQuery<AdminStats>({
    queryKey: ['admin-stats', token],
    queryFn: () => apiClient.adminStats(token!),
    enabled: !!token,
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });
};

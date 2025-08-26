// src/components/notifications/hooks/useNotifications.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

// Hook untuk mengambil notifikasi
export const useGetNotifications = () => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await axiosInstance.generalSession.get('/api/notifications/');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-notifications'] });
    },
    staleTime: 1000 * 60, // 1 menit
  });
};

// Hook untuk menandai semua sebagai sudah dibaca
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => axiosInstance.generalSession.post('/api/notifications/read-all'),
    onSuccess: () => {
      // Refresh data notifikasi setelah berhasil
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkOneAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId) => 
      axiosInstance.generalSession.post(`/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      // Refresh daftar notifikasi setelah berhasil
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
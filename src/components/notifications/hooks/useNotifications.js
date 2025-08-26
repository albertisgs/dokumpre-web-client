// src/components/notifications/hooks/useNotifications.js
import {  useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

// Hook untuk mengambil notifikasi

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
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// --- TAMBAHKAN HOOK BARU DI BAWAH INI ---
export const useDismissNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userNotificationId) =>
            axiosInstance.generalSession.delete(`/api/notifications/${userNotificationId}`),
        
        // Optimistic update untuk menghapus notifikasi dari UI secara instan
        onMutate: async (userNotificationId) => {
            await queryClient.cancelQueries({ queryKey: ['notifications'] });
            const previousNotifications = queryClient.getQueryData(['notifications']);
            
            queryClient.setQueryData(['notifications'], (oldData) => {
                if (!oldData) return oldData;

                const newData = {
                    ...oldData,
                    pages: oldData.pages.map(page => ({
                        ...page,
                        notifications: page.notifications.filter(notif => notif.id !== userNotificationId)
                    }))
                };
                return newData;
            });

            return { previousNotifications };
        },
        onError: (err, variables, context) => {
            // Jika gagal, kembalikan data notifikasi seperti semula
            if (context.previousNotifications) {
                queryClient.setQueryData(['notifications'], context.previousNotifications);
            }
        },
        onSettled: () => {
            // Selalu refetch data setelah mutasi selesai (baik sukses maupun gagal)
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};
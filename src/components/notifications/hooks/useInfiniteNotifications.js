import { useInfiniteQuery } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

const NOTIFICATIONS_PER_PAGE = 10;

const fetchNotifications = async ({ pageParam = 0 }) => {
    const response = await axiosInstance.generalSession.get(
        `/api/notifications/?limit=${NOTIFICATIONS_PER_PAGE}&offset=${pageParam}`
    );
    return response.data;
};

export const useInfiniteNotifications = () => {
  return useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // Jika halaman terakhir yang diambil memiliki notifikasi,
      // maka kemungkinan ada halaman berikutnya.
      if (lastPage.notifications.length === NOTIFICATIONS_PER_PAGE) {
        return allPages.length * NOTIFICATIONS_PER_PAGE;
      }
      // Jika tidak, kita sudah mencapai akhir.
      return undefined;
    },
  });
};
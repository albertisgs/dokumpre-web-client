import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

const fetchSyncData = async () => {
  // PERBAIKAN: Hanya satu panggilan API yang dibutuhkan sekarang.
  const response = await axiosInstance.generalSession.get('/api/user-management/');
  // Data sudah termasuk 'team_name', jadi tidak perlu proses tambahan.
  return response.data;
};

const useGetData = () => {
  return useQuery({
    queryKey: ['syncUserMngmtData'],
    queryFn: fetchSyncData, // Langsung panggil fungsi yang sudah disederhanakan
  });
};


export default useGetData;

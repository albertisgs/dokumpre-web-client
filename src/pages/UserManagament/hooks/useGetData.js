import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';
import { useAuth } from '../../../context/hooks/UseAuth';


const fetchSyncData = async (isSuperAdminUser) => {
  const endpoint = isSuperAdminUser
    ? "/api/user-management/super_admin/all"
    : "/api/user-management/";

  const response = await axiosInstance.generalSession.get(endpoint);
  return response.data;
};

const useGetData = () => {
  // 1. Ambil authState untuk mendapatkan akses ke object user
  const { authState, isSuperAdmin } = useAuth();

  return useQuery({
    // Tambahkan user.id_team ke queryKey agar query dieksekusi ulang jika user berubah
    queryKey: ['syncUserMngmtData', authState.user?.id_team],
    queryFn: () => {
      // 2. Panggil isSuperAdmin dengan user dari authState
      const isUserSuperAdmin = isSuperAdmin(authState.user);
      return fetchSyncData(isUserSuperAdmin);
    },
    // Tambahkan enabled untuk memastikan query tidak berjalan jika user belum ada
    enabled: !!authState.user, 
  });
};

export default useGetData;
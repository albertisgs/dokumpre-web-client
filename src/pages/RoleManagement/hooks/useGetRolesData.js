import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';


const fetchRolesData = async () => {
  // 1. Ambil semua role terlebih dahulu
  const rolesResponse = await axiosInstance.generalSession.get('/api/roles-management/');
  const roles = rolesResponse.data;

  if (!Array.isArray(roles) || roles.length === 0) {
    return [];
  }

  // 2. Buat array of promises untuk mengambil jumlah pengguna untuk setiap role
  const userCountPromises = roles.map(role =>
    axiosInstance.generalSession.get(`/api/roles-management/${role.id}/user-count`)
  );

  // 3. Jalankan semua promise secara paralel
  const userCountResponses = await Promise.all(userCountPromises);

  // 4. Gabungkan data role dengan jumlah penggunanya
  const rolesWithUserCount = roles.map((role, index) => {
    return {
      ...role,
      user_count: userCountResponses[index].data?.user_count || 0,
    };
  });

  return rolesWithUserCount;
};

const useGetRolesData = () => {
  return useQuery({
    queryKey: ['rolesWithUserCount'],
    queryFn: fetchRolesData,
  });
};

export default useGetRolesData;
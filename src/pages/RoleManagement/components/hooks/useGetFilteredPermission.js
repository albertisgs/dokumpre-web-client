import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../../axios/axiosInstance';


const fetchFilteredPermissions = async (teamId) => {
  // Jangan fetch jika tidak ada teamId
  if (!teamId) return [];
  const response = await axiosInstance.generalSession.get(`/api/roles-management/permissions/by-team/${teamId}`);
  return response.data;
};

const useGetFilteredPermissions = (teamId) => {
  return useQuery({
    // Query key sekarang bergantung pada teamId
    queryKey: ['filteredPermissions', teamId],
    queryFn: () => fetchFilteredPermissions(teamId),
    // Query hanya akan aktif jika teamId tersedia
    enabled: !!teamId,
   
  });
};

export default useGetFilteredPermissions;
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../../axios/axiosInstance';


const fetchPermissions = async () => {
  const response = await axiosInstance.generalSession.get('/api/roles-management/permissions/all');
  return response.data;
};

const useGetPermissions = () => {
  return useQuery({
    queryKey: ['allPermissions'],
    queryFn: fetchPermissions,
    staleTime: Infinity, // Permissions data is static, so no need to refetch often
    cacheTime: Infinity,
  });
};

export default useGetPermissions;
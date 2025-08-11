import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

const fetchRoles = async () => {
  const response = await axiosInstance.general.get('/api/user-management/roles/', {
  });
  return response.data;
};


const useGetRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => fetchRoles(), 
  });
};

export default useGetRoles;

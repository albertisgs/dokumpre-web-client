import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../../axios/axiosInstance';


const fetchTeams = async () => {
  const response = await axiosInstance.generalSession.get('/api/user-management/teams/');
  return response.data;
};

const useGetTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export default useGetTeams;
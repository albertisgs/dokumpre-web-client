import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

const fetchRolesByTeam = async (teamId) => {
  if (!teamId) return [];
  // --- UBAH URL DI BARIS BERIKUT ---
  const response = await axiosInstance.generalSession.get(`/api/user-management/roles/by-team/${teamId}`);
  return response.data;
};

const useGetRolesByTeam = (teamId) => {
  return useQuery({
    queryKey: ['rolesByTeam', teamId],
    queryFn: () => fetchRolesByTeam(teamId),
    enabled: !!teamId,
  });
};

export default useGetRolesByTeam;
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';


const fetchTeamsData = async () => {
  // 1. Ambil semua team terlebih dahulu
  const teamsResponse = await axiosInstance.generalSession.get('/api/teams-management/');
  const teams = teamsResponse.data;

  if (!Array.isArray(teams) || teams.length === 0) {
    return [];
  }

  // 2. Buat array of promises untuk mengambil jumlah pengguna untuk setiap team
  const userCountPromises = teams.map(team =>
    axiosInstance.generalSession.get(`/api/teams-management/${team.id}/user-count`)
  );

  // 3. Jalankan semua promise secara paralel
  const userCountResponses = await Promise.all(userCountPromises);

  // 4. Gabungkan data team dengan jumlah penggunanya
  const teamsWithUserCount = teams.map((team, index) => {
    return {
      ...team,
      user_count: userCountResponses[index].data?.user_count || 0,
    };
  });

  return teamsWithUserCount;
};

const useGetTeamsData = () => {
  return useQuery({
    queryKey: ['teamsWithUserCount'],
    queryFn: fetchTeamsData,
  });
};

export default useGetTeamsData;
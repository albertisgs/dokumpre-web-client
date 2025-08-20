import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../../axios/axiosInstance';
import { useAuth } from '../../../../context/hooks/useAuth';

const fetchRolesData = async (isSuperAdminUser) => {
  const rolesEndpoint = isSuperAdminUser
    ? "/api/roles-management/super_admin/all"
    : "/api/roles-management/";

  const rolesPromise = axiosInstance.generalSession.get(rolesEndpoint);
  const teamsPromise = axiosInstance.generalSession.get('/api/user-management/teams/');

  const [rolesResponse, teamsResponse] = await Promise.all([rolesPromise, teamsPromise]);

  const roles = rolesResponse.data;
  const teams = teamsResponse.data;

  if (!Array.isArray(roles) || !Array.isArray(teams)) {
    console.error("Invalid data format received from API");
    return [];
  }

  const teamsMap = new Map(teams.map(team => [team.id, team.name]));

  const rolesWithTeamNames = roles.map(role => ({
    ...role,
    team_name: teamsMap.get(role.id_team) || 'Unknown Team'
  }));

  return rolesWithTeamNames;
};

const useGetRolesData = () => {
  const { authState, isSuperAdmin } = useAuth();
  const isUserSuperAdmin = isSuperAdmin(authState.user);

  return useQuery({
    queryKey: ['rolesData', isUserSuperAdmin],
    queryFn: () => fetchRolesData(isUserSuperAdmin),
    enabled: !!authState.user,
  });
};

export default useGetRolesData;
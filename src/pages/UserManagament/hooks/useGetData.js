import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

const fetchSyncData = async (token) => {
  const usersResponse = await axiosInstance.general.get('/api/user-management/',
     {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
  );
  const users = usersResponse.data;

  if (!Array.isArray(users) || users.length === 0) {
    return [];
  }

  const rolePromises = users.map(user =>
    axiosInstance.general.get(`/api/user-management/roles/${user.id_role}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
  );

  const roleResponses = await Promise.all(rolePromises);


  const enhancedUsers = users.map((user, index) => {
   
    const roleName = roleResponses[index].data?.name || 'Unknown Role';
    return {
      ...user,
      role_name: roleName,
    };
  });

  enhancedUsers.sort((a, b) => a.email.localeCompare(b.email));

  return enhancedUsers;
};

const useGetData = (token) => {
  return useQuery({
    queryKey: ['syncUserMngmtData',token],
    queryFn: ()=> fetchSyncData(token),
    enabled: !!token
  });
};

export default useGetData;

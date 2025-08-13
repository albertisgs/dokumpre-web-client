import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

const fetchSyncData = async () => {
  const usersResponse = await axiosInstance.generalSession.get('/api/user-management/');
  const users = usersResponse.data;

  if (!Array.isArray(users) || users.length === 0) {
    return [];
  }

  const rolePromises = users.map(user =>
    axiosInstance.generalSession.get(`/api/user-management/roles/${user.id_role}`)
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

const useGetData = () => {
  return useQuery({
    queryKey: ['syncUserMngmtData'],
    queryFn: ()=> fetchSyncData(),
  });
};

export default useGetData;

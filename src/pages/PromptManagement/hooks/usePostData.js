import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

const usePostData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newData) => {
      const response = await axiosInstance.generalSession.post('/api/request/', newData);
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['syncPromptData']);
    },
  });
};

export default usePostData;

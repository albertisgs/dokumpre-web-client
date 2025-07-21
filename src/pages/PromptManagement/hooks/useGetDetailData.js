import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

const useGetDetailData = (id) => {
  return useQuery({
    queryKey: ['get-detail', id],
    queryFn: async () => {
      const res = await axiosInstance.general.get(`/api/request/get-detail?id=${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
};

export default useGetDetailData;
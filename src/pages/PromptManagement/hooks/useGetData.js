import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

const fetchSyncData = async () => {
  const res = await axiosInstance.generalSession.get('/api/request/');
  console.log(res.data.data)
  const sortedData = res.data.data.sort((a, b) => {
    const dateA = new Date(a.request_date);
    const dateB = new Date(b.request_date);
    return dateB - dateA;
  });
  return sortedData;
};

const useGetData = () => {
  return useQuery({
    queryKey: ['syncPromptData'],
    queryFn: fetchSyncData,
  });
};

export default useGetData;

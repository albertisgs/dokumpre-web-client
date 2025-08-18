import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

const fetchSyncData = async () => {
  const res = await axiosInstance.generalSession.get('/api/knowledge/');
  console.log(res.data.data)
  const sortedData = res.data.data.sort((a, b) => {
    const dateA = new Date(a.upload_date.split('/').reverse().join('-'));
    const dateB = new Date(b.upload_date.split('/').reverse().join('-'));
    return dateB - dateA;
  });
  return sortedData;
};

const useGetData = () => {
  return useQuery({
    queryKey: ['syncData'],
    queryFn: fetchSyncData,
  });
};

export default useGetData;

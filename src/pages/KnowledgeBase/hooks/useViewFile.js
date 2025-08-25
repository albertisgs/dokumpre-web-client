// import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

const useViewFile = () => {
  const viewFile = async (id) => {
    const res = await axiosInstance.generalSession.get(`/api/knowledge/knowledge-path?id=${id}`, {
      responseType: 'blob', 
    });
    return res.data; 
  };

  return { viewFile };
};

export default useViewFile;

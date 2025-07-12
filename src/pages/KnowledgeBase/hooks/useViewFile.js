import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

const useViewFile = () => {
  const viewFile = async (id) => {
    const res = await axiosInstance.general.get(`/documents/${id}`, {
      responseType: 'blob', 
    });
    return res.data; 
  };

  return { viewFile };
};

export default useViewFile;

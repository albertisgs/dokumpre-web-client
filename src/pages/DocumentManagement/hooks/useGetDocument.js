import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../axios/axiosInstance";

const getReplaceDocuments = async () => {
  try {
    const response = await axiosInstance.generalSession.get('/api/legal-documents-management');
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};


export const useGetReplaceDocument = () => {
  return useQuery({
    queryKey: ["replace-documents"],
    queryFn: getReplaceDocuments,
  });
};

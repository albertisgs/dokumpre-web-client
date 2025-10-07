import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../../axios/axiosInstance";

const getPendingDocument = async (id) => {
    try{
      const response = await axiosInstance.generalSession.get(
            `/api/legal-documents-management/pending/${id}/`
      );
      return response.data;

    }catch (error){
      if (error.response?.status === 500) {
          return null;
      }
    };
}

export const useGetPendingDocument = () => {
  return useMutation({
    mutationFn: getPendingDocument,
    onSuccess: (response) => {
      console.log("Pending document fetched:", response);
    },
    onError: (error) => {
      console.error("Failed:", error);
    },
  });
};

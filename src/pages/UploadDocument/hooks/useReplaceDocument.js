import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../../axios/axiosInstance"; 


const replaceDocument = async (formData) => {
  const response = await axiosInstance.generalSession.post(
    "/api/legal-documents/replace",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};

export const useReplaceDocument = () => {
  return useMutation({
    mutationFn: replaceDocument,
    onSuccess: (response) => {
      console.log("Success", response);
    },
    onError: (error) => {
      console.error("Failed:", error);
    },
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../axios/axiosInstance";
import toast from "react-hot-toast";

const deleteDocument = async (request_id) => {
  const response = await axiosInstance.generalSession.delete(
    `/api/legal-documents-management/?request_id=${request_id}`
  );
  return response.data;
};

export const useDeleteLegalDocument = () => {
  const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteDocument,
        onSuccess: () => {
            toast.success('Document is successfully deleted.');
            queryClient.invalidateQueries({ queryKey: ['replace-documents'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Fail to delete document.');
        }
    });
};

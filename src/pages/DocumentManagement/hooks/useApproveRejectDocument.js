import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../axios/axiosInstance";
import toast from "react-hot-toast";

const approveRejectDocument = async ({ id, approval_status }) => {
  const response = await axiosInstance.generalSession.put(
    `/api/legal-documents-management/approval/${id}/?approval_status=${approval_status}`
  );
  return response.data;
};

export const useApproveRejectDocument = (options) => {
  const queryClient = useQueryClient();

return useMutation({
    mutationFn: approveRejectDocument,
    onSuccess: async (data, variables, context) => {
      const { approval_status } = variables;

      if (approval_status === 1) {
        toast.success("Document approved successfully.");
      } else if (approval_status === 0) {
        toast.success("Document rejected successfully.");
      }

      await queryClient.invalidateQueries({ queryKey: ["replace-documents"] });
      await queryClient.invalidateQueries({ queryKey: ["legalDocuments"] });

      if (options?.onSuccess) {
        await options.onSuccess(data, variables, context);
      }
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update approval status."
      );

      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};

import { useState } from "react";
import { Trash2, CheckCircle, XCircle, Eye, FileWarning } from "lucide-react";
import ConfirmationModal from "../DocumentManagement/components/ConfirmationModal";
import { useGetReplaceDocument } from "./hooks/useGetDocument";
import { useGetLegalDocuments } from "../UploadDocument/hooks/useLegalDocuments";
import { useApproveRejectDocument } from "./hooks/useApproveRejectDocument";
import { useDeleteLegalDocument } from "./hooks/useDeleteDocument";
import toast from "react-hot-toast";


const DocumentManagement = () => {
  const { data: documents = [], isLoading, isError } = useGetReplaceDocument();
  const { data: legalDocuments = [] } = useGetLegalDocuments();
  const { mutate: approveRejectDoc, isPending } = useApproveRejectDocument();

  const { mutate: deleteDoc, isPending: isDeleting } = useDeleteLegalDocument();

  const findOriginalDocumentName = (replaceId) => {
    const original = legalDocuments.find((doc) => doc.id === replaceId);
    return original ? original.document_name : "-";
  };

  const [modalState, setModalState] = useState({
    isOpen: false,
    action: null, 
    document: null,
  });

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const permissions = userData?.permissions || [];

  const hasManagerAccess =
    permissions.length === 0 ||
    permissions.includes("document-management:manager") ||
    permissions.includes("document-management:master");

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const handleOpenModal = (action, doc) => {
    setModalState({ isOpen: true, action, document: doc });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, action: null, document: null });
  };

  const handleConfirmAction = () => {
    const { action, document } = modalState;
    if (!document) return;

    if (action === "approve" || action === "reject") {
      const approval_status = action === "approve" ? 1 : 0;
      approveRejectDoc(
        { id: document.id, approval_status },
        {
          onSettled: () => handleCloseModal(),
        }
      );
    } else if (action === "delete") {
      deleteDoc(document.id, {
        onSettled: () => handleCloseModal(),
      });
    }
  };


  const getModalContent = () => {
      const { action, document } = modalState;
      if (!document) return {};

      switch (action) {
          case 'approve':
              return {
                  title: "Confirm Approval",
                  body: `Are you sure you want to approve the document "${document.document_name}"?`,
                  confirmText: "Approve",
                  confirmColor: "bg-green-600 hover:bg-green-700 focus:ring-green-300"
              };
          case 'reject':
              return {
                  title: "Confirm Rejection",
                  body: `Are you sure you want to reject the document "${document.document_name}"?`,
                  confirmText: "Reject",
                  confirmColor: "bg-red-600 hover:bg-red-700 focus:ring-red-300"
              };
          case 'delete':
              return {
                  title: "Confirm Deletion",
                  body: `This action cannot be undone. Are you sure you want to delete "${document.document_name}"?`,
                  confirmText: "Delete",
                  confirmColor: "bg-red-600 hover:bg-red-700 focus:ring-red-300"
              };
          default:
              return {};
      }
  }

  const { title, body, confirmText, confirmColor } = getModalContent();
  if (isLoading) {
    return <div className="p-6">Loading documents...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-600">Failed to load documents.</div>;
  }


  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="bg-white rounded-lg shadow overflow-hidden p-6 flex flex-col h-full">
          <div className="overflow-y-auto flex-1">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr className="text-left text-sm font-semibold text-gray-600">
                  <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10 text-center">Request Date</th>
                  <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">Document Name</th>
                  {/* <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">To be Replaced</th> */}
                  <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10 text-center">User Request</th>
                  <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10 text-center">File Type</th>
                  <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10 text-center">Status</th>
                  <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documents && documents.length > 0 ? (
                 documents.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 text-sm text-gray-700">
                    <td className="px-4 py-3 text-center">{new Date(item.upload_date).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.document_name}</td>
                    {/* <td className="px-4 py-3 font-medium text-gray-900">
                        {findOriginalDocumentName(item.document_replace_id)}
                    </td> */}
                    <td className="px-4 py-3 text-center">{item.staff}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        {item.document_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-800" title="View">
                        <a href={`${import.meta.env.VITE_API_URL_GENERAL}/${item.file_path}`} target="_blank" rel="noopener noreferrer" className={`font-medium text-blue-600 hover:underline`}><Eye className="w-5 h-5" /></a>                          
                        </button>

                        {hasManagerAccess && (
                          <>
                            <button
                              onClick={() => handleOpenModal("approve", item)}
                              disabled={item.status !== "pending"}
                              className={`w-5 h-5 ${
                                item.status === "pending"
                                  ? "text-green-600 hover:text-green-800 cursor-pointer"
                                  : "text-gray-400 cursor-not-allowed"
                              }`}
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleOpenModal("reject", item)}
                              disabled={item.status !== "pending"}
                              className={`w-5 h-5 ${
                                item.status === "pending"
                                  ? "text-orange-600 hover:text-orange-800 cursor-pointer"
                                  : "text-gray-400 cursor-not-allowed"
                              }`}
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}

                          <button
                            onClick={() => handleOpenModal("delete", item)}
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                      </div>
                    </td>

                  </tr>
                ))
                ):(
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-gray-500">
                        <div className="flex flex-col items-center">
                            {/* <FileWarning className="w-10 h-10 text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold">No Documents Found</h3> */}
                            <p className="text-sm">There are no documents that require your attention at the moment.</p>
                        </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        title={title}
        confirmText={confirmText}
        confirmColor={confirmColor}
      >
        <p>{body}</p>
      </ConfirmationModal>
    </>
  );
};

export default DocumentManagement;
// src/pages/PromptManagement/PromptManagement.jsx

import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useGetData from "./hooks/useGetData";

import axiosInstance from "../../axios/axiosInstance";
import { SuccessPopOut } from "../../components/SuccessPopOut";
import EditPromptModal from "./components/EditPromptModal";
import DetailModal from "./components/DetailModal";
import useGetDetailData from "./hooks/useGetDetailData";
import { Loader2, Search, Edit, Trash2, CheckCircle, XCircle, Eye } from "lucide-react";
import { useAuth } from "../../context/hooks/useAuth";

const PromptManagement = () => {
// --- State Management & Hooks ---
  const { setIsModalOpen } = useOutletContext();
  const { authState } = useAuth();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Data Fetching ---
  const { data, isLoading, error } = useGetData();
  const { data: detailData, isLoading: isDetailLoading, isError: isDetailError } = useGetDetailData(selectedId);

  // --- Permission Checks ---
  const canManage = authState.user?.permissions?.includes("prompt-management:manager") || false;
  const canUpdate = authState.user?.permissions?.includes("prompt-management:update") || false;
  const canDelete = authState.user?.permissions?.includes("prompt-management:delete") || false;

  // --- API Mutations ---
  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.generalSession.delete(`/api/request/${id}`),
    onSuccess: () => {
      SuccessPopOut("Deleted!", "success", "Prompt has been successfully deleted.");
      queryClient.invalidateQueries({ queryKey: ['syncPromptData'] });
    },
    onError: (err) => {
      SuccessPopOut("Error", "error", err.response?.data?.message || "Failed to delete prompt.");
    }
  });

  const approveMutation = useMutation({
    mutationFn: (id) => axiosInstance.generalSession.post(`/api/request/${id}/approve`),
    onSuccess: () => {
      SuccessPopOut("Approved", "success", "Prompt has been successfully approved.");
      queryClient.invalidateQueries({ queryKey: ['syncPromptData'] });
    },
     onError: (err) => {
      SuccessPopOut("Error", "error", err.response?.data?.message || "Failed to approve prompt.");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => axiosInstance.generalSession.post(`/api/request/${id}/reject`),
    onSuccess: () => {
      SuccessPopOut("Rejected", "success", "Prompt has been successfully rejected.");
      queryClient.invalidateQueries({ queryKey: ['syncPromptData'] });
    },
     onError: (err) => {
      SuccessPopOut("Error", "error", err.response?.data?.message || "Failed to reject prompt.");
    }
  });

  // --- Event Handlers ---
  const handleShowDetail = (id) => {
    setSelectedId(id);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (prompt) => {
    setSelectedPrompt(prompt);
    setIsEditModalOpen(true);
  };
  
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this prompt? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  // --- Data Filtering ---
  const filteredData = data?.filter((item) =>
    Object.values(item).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  // --- Helper Functions for Badges ---
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // --- FUNGSI BARU UNTUK WARNA PRIORITAS ---
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-orange-100 text-orange-800';
      case 'Low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="bg-white rounded-lg shadow overflow-hidden p-6 flex flex-col h-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            New Prompt
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr className="text-left text-sm font-semibold text-gray-600">
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">Request Date</th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">Usecase</th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">User Request</th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">Team</th>
                {/* --- TAMBAHKAN HEADER PRIORITY --- */}
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">Priority</th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">Status</th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading && (
                <tr><td colSpan="7" className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" /></td></tr>
              )}
              {error && (
                <tr><td colSpan="7" className="text-center py-10 text-red-500">Error fetching data.</td></tr>
              )}
              {!isLoading && !error && filteredData?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 text-sm text-gray-700">
                  <td className="px-4 py-3">{new Date(item.request_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.usecase_name}</td>
                  <td className="px-4 py-3">{item.user_request}</td>
                  <td className="px-4 py-3">{item.team}</td>
                  {/* --- TAMBAHKAN SEL UNTUK PRIORITY DENGAN WARNA --- */}
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(item.priority)}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleShowDetail(item.id)} className="text-green-600 hover:text-green-800" title="View Detail"><Eye className="w-5 h-5"/></button>
                      
                      {canUpdate && item.status === 'pending' && (
                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800" title="Edit"><Edit className="w-4 h-4" /></button>
                      )}

                      {canDelete && <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800" title="Delete"><Trash2 className="w-4 h-4" /></button>}

                      {canManage && item.status === 'pending' && (
                        <>
                          <button onClick={() => approveMutation.mutate(item.id)} className="text-green-600 hover:text-green-800" title="Approve"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => rejectMutation.mutate(item.id)} className="text-orange-600 hover:text-orange-800" title="Reject"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* --- Modals --- */}
      <EditPromptModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        promptData={selectedPrompt}
        onSuccess={() => SuccessPopOut("Updated!", "success", "Prompt has been successfully updated.")}
      />
      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={detailData}
        isLoading={isDetailLoading}
        isError={isDetailError}
      />
    </div>
  );
};

export default PromptManagement;

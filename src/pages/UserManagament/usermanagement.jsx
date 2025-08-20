import { useState } from "react";

import useGetData from "./hooks/useGetData";
import { SuccessPopOut } from "../../components/SuccessPopOut";
import { Loader2, Search, Trash2, Edit, Plus, AlertTriangle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../axios/axiosInstance";
import UserManagementModal from "./hooks/UserManagementModal";
import { useAuth } from "../../context/hooks/UseAuth";


// A simple, self-contained confirmation modal for the delete action
const ConfirmationModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
          <h2 className="text-xl font-bold">Confirm Deletion</h2>
        </div>
        <p className="text-gray-600 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 flex items-center"
          >
            {isLoading && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};


const UserManagement = () => {
  const { authState } = useAuth();
  const token = authState.authType === 'credential' ? authState.token : authState.id_token;
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users, isLoading, isError } = useGetData(token);

  // Mutation for handling the DELETE API call
  const deleteMutation = useMutation({
    mutationFn: (userId) => {
      return axiosInstance.generalSession.delete(`/api/user-management/${userId}`);
    },
    onSuccess: () => {
      SuccessPopOut("Success", "success", "User deleted successfully.");
      queryClient.invalidateQueries(['syncUserMngmtData', token]); // Refetch data on success
    },
    onError: () => {
      SuccessPopOut("Error", "error", "Failed to delete user.");
    },
    onSettled: () => {
      // Close the confirmation modal regardless of outcome
      setIsConfirmOpen(false);
      setUserToDelete(null);
    },
  });

  const filteredData = users?.filter(
    (item) =>
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.account_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // When the delete icon is clicked, open the confirmation modal
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsConfirmOpen(true);
  };

  // When the delete is confirmed, execute the mutation
  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id);
    }
  };

  const handleSuccess = (message) => {
    SuccessPopOut("Success", "success", message);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="bg-white rounded-lg shadow overflow-hidden p-6 flex flex-col h-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by email, team, or type..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 md:w-80 font-open-sans"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            add email
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr className="text-left text-sm font-semibold text-gray-600">
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">Email</th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">Team</th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">Type</th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-red-500">
                    Error fetching data. Please try again.
                  </td>
                </tr>
              )}
              {!isLoading && !isError && filteredData?.length > 0 ? (
                filteredData.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 text-sm text-gray-700">
                    <td className="px-4 py-3 font-medium text-gray-900">{user.email}</td>
                    <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.team_name === 'superadmin' ? 'bg-red-100 text-red-800' :
                            user.team_name === 'finance' ? 'bg-green-100 text-green-800' :
                            user.team_name === 'legal' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {user.team_name}
                        </span>
                    </td>
                    <td className="px-4 py-3 capitalize">{user.account_type}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        className="text-blue-600 hover:text-blue-800 mr-4"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                !isLoading && !isError && (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                      {searchTerm ? "No results found." : "No users available."}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* The Modal for Creating/Editing Users from the Canvas */}
      <UserManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        token={token}
        onSuccess={handleSuccess}
      />
      {/* The Confirmation Modal for Deleting Users */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isLoading}
      />
    </div>
  );
};

export default UserManagement;

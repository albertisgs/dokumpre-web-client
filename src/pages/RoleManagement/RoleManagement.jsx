import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, Trash2, Edit, Plus, Eye } from "lucide-react";
import RoleManagementModal from "./components/RoleManagementModal";
import ConfirmationModal from "./components/ConfirmationModal";
import { SuccessPopOut } from "../../components/SuccessPopOut";
import axiosInstance from "../../axios/axiosInstance";
import useGetRolesData from "./components/hooks/useGetRolesData";
import ViewPermissionsModal from "./components/ViewPermissionsModal";

const RoleManagement = () => {
  const queryClient = useQueryClient();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [roleToView, setRoleToView] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: roles, isLoading, isError } = useGetRolesData();

  const deleteMutation = useMutation({
    mutationFn: (roleId) => axiosInstance.generalSession.delete(`/api/roles-management/${roleId}`),
    onSuccess: () => {
      SuccessPopOut("Success", "success", "Role deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['rolesData'] });
    },
    onError: (error) => {
      SuccessPopOut("Error", "error", error.response?.data?.detail || "Failed to delete role.");
    },
    onSettled: () => {
      setIsConfirmOpen(false);
      setRoleToDelete(null);
    },
  });

  const filteredData = roles?.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.team_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreateModal = () => {
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (roleToDelete) {
      deleteMutation.mutate(roleToDelete.id);
    }
  };

  const handleSuccess = (message) => {
    SuccessPopOut("Success", "success", message);
  };

  const handleOpenViewModal = (role) => {
    setRoleToView(role);
    setIsViewModalOpen(true);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="bg-white rounded-lg shadow overflow-hidden p-6 flex flex-col h-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by role or team name..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Role
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr className="text-left text-sm font-semibold text-gray-600">
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">Role Name</th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">Team</th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">Permissions</th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td colSpan="4" className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" /></td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-red-500">Error fetching data.</td>
                </tr>
              )}
              {!isLoading && !isError && filteredData?.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50 text-sm text-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 capitalize">{role.name}</td>
                  <td className="px-4 py-3">
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          role.team_name === 'superadmin' ? 'bg-red-100 text-red-800' :
                          role.team_name === 'finance' ? 'bg-green-100 text-green-800' :
                          role.team_name === 'legal' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                          {role.team_name}
                      </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-md">
                      {role.permissions.slice(0, 3).map(p => (
                        <span key={p.id} className="px-2 py-0.5 text-xs bg-gray-200 text-gray-800 rounded-full">{p.name}</span>
                      ))}
                      {role.permissions.length > 3 && (
                         <span className="px-2 py-0.5 text-xs bg-gray-300 text-gray-800 rounded-full">+{role.permissions.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                     {/* --- TAMBAHKAN TOMBOL VIEW DI SINI --- */}
                    <button onClick={() => handleOpenViewModal(role)} className="text-green-600 hover:text-green-800 mr-4" title="View Details">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleOpenEditModal(role)} className="text-blue-600 hover:text-blue-800 mr-4" title="Edit">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDeleteClick(role)} className="text-red-600 hover:text-red-800" title="Delete">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       <ViewPermissionsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        role={roleToView}
      />
      
      <RoleManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        role={selectedRole}
        onSuccess={handleSuccess}
      />
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        itemType="role"
      />
    </div>
  );
};

export default RoleManagement;
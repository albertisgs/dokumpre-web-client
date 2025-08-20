import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../../context/hooks/useAuth";
import useGetTeams from "../../UserManagament/hooks/useGetTeams";
import useGetPermissions from "../components/hooks/useGetPermissions";
import axiosInstance from "../../../axios/axiosInstance";

const RoleManagementModal = ({ isOpen, onClose, role, onSuccess }) => {
  const queryClient = useQueryClient();
  const { authState, isSuperAdmin } = useAuth();
  const currentUserIsSuperAdmin = isSuperAdmin(authState.user);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    id_team: "",
  });
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [error, setError] = useState("");
  const isEditMode = !!role;

  // --- STATE BARU UNTUK TAB ---
  const [activeTab, setActiveTab] = useState("crud"); // 'crud' or 'special'

  const { data: allPermissions, isLoading: permissionsLoading } =
    useGetPermissions();
  const { data: allTeams, isLoading: teamsLoading } = useGetTeams();

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setFormData({
          name: role.name || "",
          description: role.description || "",
          id_team: role.id_team || "",
        });
        setSelectedPermissions(
          new Set(role.permissions?.map((p) => p.id) || [])
        );
      } else {
        const defaultTeam = currentUserIsSuperAdmin
          ? ""
          : authState.user?.id_team;
        setFormData({ name: "", description: "", id_team: defaultTeam });
        setSelectedPermissions(new Set());
      }
      setError("");
      setActiveTab("crud"); // Reset tab to default when modal opens
    }
  }, [isOpen, role, isEditMode, currentUserIsSuperAdmin, authState.user]);

  const mutation = useMutation({
     mutationFn: (payload) => {
            if (isEditMode) {
                // Logika EDIT tetap sama
                return axiosInstance.generalSession.put(`/api/roles-management/${role.id}`, {
                    name: payload.name,
                    description: payload.description,
                    permission_ids: Array.from(payload.permissions),
                });
            } else {
                // LOGIKA CREATE YANG BARU: Kirim semua data sekaligus
                return axiosInstance.generalSession.post('/api/roles-management/', {
                    name: payload.name,
                    description: payload.description,
                    id_team: payload.id_team,
                    permission_ids: Array.from(payload.permissions),
                });
            }
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['rolesData'] });
          onSuccess(isEditMode ? 'Role updated successfully!' : 'Role created successfully!');
          onClose();
        },
        onError: (err) => {
          setError(err.response?.data?.detail || 'An unexpected error occurred.');
        },
    });

  const handleCheckboxChange = (permissionId) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      newSet.has(permissionId)
        ? newSet.delete(permissionId)
        : newSet.add(permissionId);
      return newSet;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.id_team) {
      setError("Role Name and Team are required.");
      return;
    }
    setError("");
    mutation.mutate({ ...formData, permissions: selectedPermissions });
  };

  // --- LOGIKA BARU UNTUK MEMFILTER PERMISSIONS ---
  const crudPermissions = allPermissions?.filter((p) =>
    ["create", "read", "update", "delete"].some((keyword) =>
      p.name.includes(keyword)
    )
  );
  const specialPermissions = allPermissions?.filter((p) =>
    ["manager", "master"].some((keyword) => p.name.includes(keyword))
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">
          {isEditMode ? "Edit Role" : "Create New Role"}
        </h2>
        <form onSubmit={handleSubmit}>
          {currentUserIsSuperAdmin && (
            <div className="mb-4">
              <label
                htmlFor="team"
                className="block text-sm font-medium text-gray-700"
              >
                Team
              </label>
              {teamsLoading ? (
                <p>Loading teams...</p>
              ) : (
                <select
                  id="team"
                  value={formData.id_team}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, id_team: e.target.value }))
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  disabled={isEditMode}
                >
                  <option value="" disabled>
                    Select a team
                  </option>
                  {allTeams?.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Form fields untuk Name, Description, dan Team (tidak berubah) */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Role Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((f) => ({ ...f, name: e.target.value }))
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((f) => ({ ...f, description: e.target.value }))
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="2"
            ></textarea>
          </div>

          {/* --- BAGIAN PERMISSIONS DENGAN TAB --- */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Permissions
            </label>
            {/* Tab Buttons */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                  type="button"
                  onClick={() => setActiveTab("crud")}
                  className={`${
                    activeTab === "crud"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                >
                  CRUD
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("special")}
                  className={`${
                    activeTab === "special"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                >
                  Manager & Master
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-2 border p-3 rounded-b-md max-h-48 overflow-y-auto">
              {permissionsLoading ? (
                <p>Loading permissions...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* Tampilkan konten berdasarkan tab yang aktif */}
                  {(activeTab === "crud"
                    ? crudPermissions
                    : specialPermissions
                  )?.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center space-x-2 border-b border-gray-400 py-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.has(p.id)}
                        onChange={() => handleCheckboxChange(p.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-800 capitalize">
                        {p.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-300 flex items-center"
            >
              {mutation.isPending && (
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
              )}
              {isEditMode ? "Save Changes" : "Create Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleManagementModal;

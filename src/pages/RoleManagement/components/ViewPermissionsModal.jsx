import { ShieldCheck, X } from "lucide-react";

const ViewPermissionsModal = ({ isOpen, onClose, role }) => {
  if (!isOpen || !role) return null;

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Role Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Role and Team Info */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="mb-2">
            <span className="font-semibold text-gray-700">Role Name:</span>
            <p className="text-lg text-gray-900 capitalize">{role.name}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Team:</span>
            <p className="text-lg text-gray-900 capitalize">{role.team_name || 'Unknown Team'}</p>
          </div>
        </div>

        {/* Permissions List */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">Assigned Permissions</h3>
          <div className="max-h-60 overflow-y-auto pr-2">
            {role.permissions && role.permissions.length > 0 ? (
              <ul className="space-y-2">
                {role.permissions.map(permission => (
                  <li key={permission.id} className="flex items-center bg-white p-2 border rounded-md">
                    <ShieldCheck className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{permission.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">No permissions assigned to this role.</p>
            )}
          </div>
        </div>
        
        {/* Close Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPermissionsModal;
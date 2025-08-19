import { Loader2, AlertTriangle } from "lucide-react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
          <h2 className="text-xl font-bold">Confirm Deletion</h2>
        </div>
        <p className="text-gray-600 mb-6">Are you sure you want to delete this team? This action cannot be undone.</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center disabled:bg-red-300"
          >
            {isLoading && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
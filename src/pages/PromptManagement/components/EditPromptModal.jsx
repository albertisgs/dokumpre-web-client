// src/pages/PromptManagement/components/EditPromptModal.jsx

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../axios/axiosInstance";
import { Loader2 } from "lucide-react";

const EditPromptModal = ({ isOpen, onClose, onSuccess, promptData }) => {
  if (!isOpen) return null;

  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (promptData) {
      setFormData({
        usecase_name: promptData.usecase_name || '',
        // 'user_request' dan 'team' tidak lagi di-set di sini karena tidak bisa diedit
        priority: promptData.priority || 'High',
        reason: promptData.reason || '',
        prompt: promptData.prompt || '',
      });
    }
  }, [promptData]);

  const mutation = useMutation({
    mutationFn: (updatedData) => 
      axiosInstance.generalSession.put(`/api/request/${promptData.id}`, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syncPromptData'] });
      onSuccess();
      onClose();
    },
    onError: (err) => {
      // Menampilkan pesan error yang lebih spesifik jika ada
      alert(err.response?.data?.message || "An error occurred while updating.");
    }
  });

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Edit Prompt</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            {/* ... (ikon 'X') ... */}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usecase Name</label>
              <input
                type="text"
                value={formData.usecase_name || ''}
                onChange={handleChange('usecase_name')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            {/* Input untuk User Request dan Team sudah DIHAPUS */}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority || 'High'}
                onChange={handleChange('priority')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                rows={2}
                value={formData.reason || ''}
                onChange={handleChange('reason')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
              <textarea
                rows={4}
                value={formData.prompt || ''}
                onChange={handleChange('prompt')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              ></textarea>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center">
              {mutation.isPending && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPromptModal;
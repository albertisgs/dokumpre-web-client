import { useState } from "react";

const NewPromptModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    usecaseName: '',
    userRequest: '',
    team: '',
    priority: 'High',
    reason: '',
    prompt: '',
  });

  const isDisabled = Object.values(formData).some((val) => !val.trim());

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      'Usecase Name': formData.usecaseName,
      'User Request': formData.userRequest,
      Team: formData.team,
      Priority: formData.priority,
      Reason: formData.reason,
      Prompt: formData.prompt,
    });
    onClose(); 
  };

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800 font-open-sans">Create New Prompt</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usecase Name</label>
              <input
                type="text"
                value={formData.usecaseName}
                onChange={handleChange('usecaseName')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User Request</label>
              <input
                type="text"
                value={formData.userRequest}
                onChange={handleChange('userRequest')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
              <input
                type="text"
                value={formData.team}
                onChange={handleChange('team')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={handleChange('priority')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                value={formData.reason}
                onChange={handleChange('reason')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
              <textarea
                rows={4}
                value={formData.prompt}
                onChange={handleChange('prompt')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDisabled}
              className={`px-4 py-2 rounded-lg text-white transition-colors ${
                isDisabled
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Save Prompt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPromptModal;

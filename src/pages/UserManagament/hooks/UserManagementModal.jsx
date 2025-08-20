import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';
import useGetTeams from '../hooks/useGetTeams';
import { Loader2 } from 'lucide-react';

const UserManagementModal = ({ isOpen, onClose, user, token, onSuccess }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    email: '',
    id_team: '',
    account_type: 'credential',
  });
  const [error, setError] = useState('');

  const { data: teams, isLoading: teamsLoading } = useGetTeams(token);
  const isEditMode = !!user;

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        email: user.email || '',
        id_team: user.id_team || '',
        account_type: user.account_type || 'credential',
      });
    } else {
      setFormData({ email: '', id_team: '', account_type: 'credential' });
    }
    setError('');
  }, [isOpen, user, isEditMode]);

  const mutation = useMutation({
    mutationFn: (userData) => {
      if (isEditMode) {
        // UPDATE (PUT) operation
        return axiosInstance.generalSession.put(`/api/user-management/${user.id}`, userData);
      } else {
        // CREATE (POST) operation
        return axiosInstance.generalSession.post('/api/user-management/', userData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['syncUserMngmtData', token]);
      onSuccess(isEditMode ? 'User updated successfully!' : 'User created successfully!');
      onClose();
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.id_team || !formData.account_type) {
      setError('All fields are required.');
      return;
    }
    setError('');
    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Edit User' : 'Create New User'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isEditMode}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="team" className="block text-sm font-medium text-gray-700">Team</label>
            {teamsLoading ? (
              <p>Loading teams...</p>
            ) : (
              <select
                id="team"
                value={formData.id_team}
                onChange={(e) => setFormData({ ...formData, id_team: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="" disabled>Select a team</option>
                {teams?.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="account_type" className="block text-sm font-medium text-gray-700">Account Type</label>
            <select
              id="account_type"
              value={formData.account_type}
              onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isEditMode}
            >
              <option value="credential">Credential</option>
              <option value="google">Google</option>
              <option value="microsoft">Microsoft</option>
            </select>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
            >
              {mutation.isLoading && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
              {isEditMode ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagementModal;

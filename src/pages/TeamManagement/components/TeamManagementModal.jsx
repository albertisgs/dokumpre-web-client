import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import axiosInstance from '../../../axios/axiosInstance';

// Daftar hak akses yang valid, harus sama dengan yang ada di backend
const VALID_ACCESS_RIGHTS = [
    "dashboard","knowledge-base","market-competitor-insight","prompt-management","upload-document","sipp-case-details","user-management","team-management","role-management"
];

const TeamManagementModal = ({ isOpen, onClose, team, onSuccess }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [access, setAccess] = useState(new Set());
  const [error, setError] = useState('');
  const isEditMode = !!team;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setName(team.name || '');
        setAccess(new Set(team.access || []));
      } else {
        setName('');
        setAccess(new Set());
      }
      setError('');
    }
  }, [isOpen, team, isEditMode]);

  const mutation = useMutation({
    mutationFn: (teamData) => {
      const payload = { ...teamData, access: Array.from(teamData.access) };
      if (isEditMode) {
        return axiosInstance.generalSession.put(`/api/teams-management/${team.id}`, payload);
      } else {
        return axiosInstance.generalSession.post('/api/teams-management/', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamsWithUserCount'] });
      onSuccess(isEditMode ? 'Team updated successfully!' : 'Team created successfully!');
      onClose();
    },
    onError: (err) => {
      setError(err.response?.data?.detail || 'An unexpected error occurred.');
    },
  });

  const handleCheckboxChange = (right) => {
    setAccess(prevAccess => {
      const newAccess = new Set(prevAccess);
      if (newAccess.has(right)) {
        newAccess.delete(right);
      } else {
        newAccess.add(right);
      }
      return newAccess;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) {
      setError('Team name is required.');
      return;
    }
    setError('');
    mutation.mutate({ name, access });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Team' : 'Create New Team'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Team Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Access Rights</label>
            <div className="mt-2 grid grid-cols-2 gap-2 border p-3 rounded-md max-h-48 overflow-y-auto">
              {VALID_ACCESS_RIGHTS.map(right => (
                <label key={right} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={access.has(right)}
                    onChange={() => handleCheckboxChange(right)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-800 capitalize">{right.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-300 flex items-center">
              {mutation.isPending && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
              {isEditMode ? 'Save Changes' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamManagementModal;
import { useState } from "react";
import NewPromptModal from "./components/NewPromptModal";

const PromptManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div
      className="flex-col flex-1 min-h-0 overflow-y-auto"
    >
      <div className="bg-white rounded-lg shadow overflow-hidden p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search prompts..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 md:w-80 font-open-sans"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center w-full sm:w-auto justify-center button-label-custom"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            New Prompt
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100 text-gray-700 text-center font-open-sans font-bold text-md">
              <tr>
                <th className="px-4 py-3">Request Date</th>
                <th className="px-4 py-3">Usecase Name</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">User Request</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Prompt</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-center">
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <span
            className="text-sm text-gray-500 font-open-sans"
            id="prompt-table-info"
          >
            No entries
          </span>
          <div className="flex space-x-1 hidden">
            <button className="px-3 py-1 border rounded-md text-sm text-gray-600 hover:bg-gray-100 font-open-sans">
              Previous
            </button>
            <button className="px-3 py-1 border rounded-md text-sm text-white bg-blue-600 font-open-sans">
              1
            </button>
            <button className="px-3 py-1 border rounded-md text-sm text-gray-600 hover:bg-gray-100 font-open-sans">
              Next
            </button>
          </div>
        </div>
      </div>
      <NewPromptModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
    
  );
};

export default PromptManagement;

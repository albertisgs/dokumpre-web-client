import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import useGetData from "./hooks/useGetData";

const PromptManagement = () => {
  const { isModalOpen, setIsModalOpen } = useOutletContext();
  const { isModalOpenDetail, setIsModalOpenDetail, setSelectedId } = useOutletContext();

  const [searchTerm, setSearchTerm] = useState("");

  const handleShowDetail = (id) => {
    setSelectedId(id);
    setIsModalOpenDetail(true);
  };

  const { data, loading, error, refetch } = useGetData();

  const filteredData = data?.filter((item) =>
    item.usecase_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user_request.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.request_date.toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="bg-white rounded-lg shadow overflow-hidden p-6 flex flex-col h-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 md:w-80 font-open-sans"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center w-full sm:w-auto justify-center button-label-custom cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Prompt
          </button>
        </div>

        <div className="overflow-y-auto max-h-[560px]">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr className="table-header-custom">
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">Request Date</th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">Usecase Name</th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">Priority</th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">User Request</th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">Team</th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">Reason</th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">Prompt</th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-400">Loading...</td>
                </tr>
              )}
              {error && (
                 <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-red-500">Error fetching data.</td>
                </tr>
              )}
              {!loading && !error && filteredData?.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="table-cell-custom hover:bg-gray-50">
                    <td className="px-6 py-4 text-center font-medium text-gray-900 whitespace-nowrap">{item.request_date && new Date(item.request_date).toISOString().split("T")[0]}</td>
                    <td className="px-6 py-4 text-center">{item.usecase_name}</td>
                    <td className="px-6 py-4 text-center">{item.priority}</td>
                    <td className="px-6 py-4 text-center">{item.user_request}</td>
                    <td className="px-6 py-4 text-center">{item.team}</td>
                    <td className="px-6 py-4 text-center">{item.reason}</td>
                    <td className="px-6 py-4 font-mono text-xs max-w-[20rem] truncate">{item.prompt}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        className="text-blue-600 hover:underline cursor-pointer"
                        onClick={() => handleShowDetail(item.id)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                 !loading && !error && (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-400">
                        {searchTerm ? "No results found." : "No data available."}
                      </td>
                    </tr>
                 )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PromptManagement;
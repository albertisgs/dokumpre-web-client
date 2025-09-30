import { Trash2, CheckCircle, XCircle, Eye } from "lucide-react";

const DocumentManagement = () => {
  const dummyData = [
    {
      id: 1,
      request_date: "2025-09-20",
      document_name: "Document 1",
      user_request: "testuser",
      type: "pdf",
      status: "pending",
    },
    {
      id: 2,
      request_date: "2025-09-18",
      document_name: "Document 2",
      user_request: "testuser",
      type: "txt",
      status: "approved",
    },
    {
      id: 3,
      request_date: "2025-09-15",
      document_name: "Document 3",
      user_request: "testuser",
      type: "pdf",
      status: "rejected",
    },
  ];

  // --- Helper Functions for Badges ---
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="bg-white rounded-lg shadow overflow-hidden p-6 flex flex-col h-full">
        <div className="overflow-y-auto flex-1">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr className="text-left text-sm font-semibold text-gray-600">
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">
                  Request Date
                </th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">
                  Document Name
                </th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">
                  User Request
                </th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">
                  File Type
                </th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10">
                  Status
                </th>
                <th className="px-4 py-3 sticky top-0 bg-gray-100 z-10 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dummyData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 text-sm text-gray-700"
                >
                  <td className="px-4 py-3">
                    {new Date(item.request_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {item.document_name}
                  </td>
                  <td className="px-4 py-3">{item.user_request}</td>
                  <td className="px-4 py-3">{item.type}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => alert("TODO: Implement View")}
                        className="text-green-600 hover:text-green-800"
                        title="View"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => alert("TODO: Implement Approve")}
                        className="text-green-600 hover:text-green-800"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => alert("TODO: Implement Reject")}
                        className="text-orange-600 hover:text-orange-800"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => alert("TODO: Implement Delete")}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentManagement;

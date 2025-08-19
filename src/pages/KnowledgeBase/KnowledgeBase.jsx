import useGetData from "./hooks/useGetData";
// import useViewFile from "./hooks/useViewFile";

const KnowledgeBase = () => {
  const { data, loading, error } = useGetData();

  return (
    <div>
      <div className="text-gray-500 text-md">
        This page is used to upload documents that will be used as the knowledge
        base for the chatbot.
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <div className="relative overflow-x-auto max-h-[580px] overflow-y-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">Company Name</th>
                <th className="px-6 py-4">Report Title</th>
                <th className="px-6 py-4">Year</th>
                <th className="px-6 py-4">Upload Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading && !error && data?.length > 0 ? (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="bg-white border-b hover:bg-gray-50 border-gray-200"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {item.company_name}
                    </td>
                    <td className="px-6 py-4">{item.report_title}</td>
                    <td className="px-6 py-4">{item.year}</td>
                    <td className="px-6 py-4">
                      {item.upload_date.replaceAll("/", "-")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === "Completed" ||
                          item.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <a
                        href={`${import.meta.env.VITE_API_URL_GENERAL}/public${
                          item.file_path
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))
              ) : loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;

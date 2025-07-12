const KnowledgeBase = () => {
  return (
    <div>
      <div className="text-gray-500 text-md">
        This page is used to upload documents that will be used as the knowledge base for the chatbot.
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-6 py-3">Company Name</th>
                <th className="px-6 py-3">Report Title</th>
                <th className="px-6 py-3">Year</th>
                <th className="px-6 py-3">Upload Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody id="report-table-body">
            </tbody>
          </table>
        </div>
      </div>

    </div>

  );
}
export default KnowledgeBase
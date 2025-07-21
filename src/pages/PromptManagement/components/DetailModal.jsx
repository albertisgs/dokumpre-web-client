const DetailModal = ({ isOpen, onClose, data, isLoading, isError  }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 font-open-sans">
            Prompt Details
          </h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
          </button>
        </div>

        {isLoading && <p>Loading...</p>}
        {isError && <p>Failed to fetch detail.</p>}

        {data && (
          <div className="space-y-3 mb-6 font-open-sans text-size-14">
            <div><strong className="text-gray-600 w-32 inline-block">Request Date:</strong> <span className="text-gray-800">{data.request_date && new Date(data.request_date).toISOString().split("T")[0]}</span></div>
            <div><strong className="text-gray-600 w-32 inline-block">Usecase Name:</strong> <span className="text-gray-800">{data.usecase_name}</span></div>
            <div><strong className="text-gray-600 w-32 inline-block">Priority:</strong> <span className="text-gray-800">{data.priority}</span></div>
            <div><strong className="text-gray-600 w-32 inline-block">User Request:</strong> <span className="text-gray-800">{data.user_request}</span></div>
            <div><strong className="text-gray-600 w-32 inline-block">Team:</strong> <span className="text-gray-800">{data.team}</span></div>
            <div><strong className="text-gray-600 w-32 inline-block">Reason:</strong> <span className="text-gray-800">{data.reason}</span></div>
            <div><strong className="text-gray-600 block mb-1">Prompt:</strong>
              <div className="prompt-preview-area text-sm text-gray-800">{data.prompt}</div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;

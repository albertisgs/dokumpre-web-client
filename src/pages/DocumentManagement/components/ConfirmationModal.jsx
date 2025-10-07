import { X } from "lucide-react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = "Confirm",
  confirmColor = "bg-blue-600 hover:bg-blue-700",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex items-start justify-between pb-4 border-b border-gray-200 rounded-t">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        <div className="py-5 text-base leading-relaxed text-gray-600">
          {children}
        </div>

        <div className="flex items-center justify-end pt-4 space-x-3 border-t border-gray-200 rounded-b">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 focus:z-10 focus:ring-4 focus:ring-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg focus:ring-4 focus:outline-none ${confirmColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
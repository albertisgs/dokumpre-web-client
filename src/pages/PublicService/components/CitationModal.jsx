// src/components/CitationModal.jsx

import React, { useEffect, useState } from 'react';

const CitationModal = ({ citation, onClose }) => {
  const [isShowing, setIsShowing] = useState(false);

  // Efek untuk animasi fade-in
  useEffect(() => {
    // Timeout kecil untuk memastikan elemen sudah di-mount sebelum transisi dimulai
    const timer = setTimeout(() => setIsShowing(true), 10);
    return () => clearTimeout(timer);
  }, []);

  if (!citation) return null;

  return (
    // Latar belakang overlay
    <div
      onClick={onClose}
      className="modal-overlay"
    >
      {/* Kontainer Modal */}
      <div
        onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat diklik di dalam
        className={`bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300 ${isShowing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{citation.documentName}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Konten Modal */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {citation.content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CitationModal;
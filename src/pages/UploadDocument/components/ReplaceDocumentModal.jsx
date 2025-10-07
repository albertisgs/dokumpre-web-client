import { Clock, Info, Loader2, UploadCloud, X } from "lucide-react";
import React, { useState } from "react";

const ReplaceDocumentModal = ({ isOpen, onClose, document, pendingDocument, onReplace, isReplacing, isPending }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef(null);

  const hasPending = !!pendingDocument;
  React.useEffect(() => {
    if (!isOpen) {
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"];
    if (allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      toast.error("File type not supported. Only Word, PDF, JPG, & PNG.");
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };
  
  const handleConfirmReplace = () => {
    if (file) {
      onReplace(file);
    } else {
      toast.error("Please select a replacement file first.");
    }
  };

  const getStatusComponent = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
      default: return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
};

  if (!isOpen) return null;
  

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 transition-opacity">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 m-4 animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Replace Document</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X className="w-6 h-6" /></button>
        </div>
        <p className="text-sm text-gray-600 mb-4">You will replace the: <span className="font-semibold">{document?.document_name}</span></p>
        
        {isPending ? (
            <div className="text-center p-8"><Loader2 className="animate-spin inline-block text-blue-500" /></div>
        ) : (
            <>
                <div 
                    onDragOver={handleDragOver} 
                    onDragLeave={handleDragLeave} 
                    onDrop={handleDrop} 
                    className={`p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center transition-colors duration-300 
                        ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
                        ${hasPending && "bg-gray-100 border-gray-200 cursor-not-allowed opacity-60"}
                    `}
                >
                    <input type="file" ref={fileInputRef} id="replace-file-input" className="hidden" onChange={(e) => handleFileSelect(e.target.files[0])} accept=".pdf,.txt,application/pdf,text/plain" disabled={hasPending} />
                    <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                    <p className="text-gray-600">
                        Drag a file, or <label htmlFor="replace-file-input" className={`font-semibold ${hasPending ? 'text-gray-500' : 'text-blue-600 cursor-pointer hover:underline'}`}>choose file</label>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Only 1 file is allowed.</p>
                </div>

                {hasPending && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                             <h4 className="font-semibold text-gray-800">Replacement Document is Being Processed</h4>
                             <div className="relative group">
                                <Info className="w-5 h-5 text-blue-500"/>
                                <div className="absolute bottom-full mb-2 w-64 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 -translate-x-1/2 left-1/2">
                                    The previous replacement document must be approved or rejected by the manager before you can upload a new version.
                                </div>
                             </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                            <p><strong>File Name:</strong> {pendingDocument.document_name}</p>
                            <p className="flex items-center gap-2"><strong>Status:</strong> {getStatusComponent(pendingDocument.status)}</p>
                        </div>
                    </div>
                )}
                
                {!hasPending && file && (
                  <div className="mt-4 bg-gray-50 p-2 rounded-md flex items-center justify-between">
                      <span className="text-sm text-gray-800">{file.name}</span>
                      <button onClick={handleRemoveFile} className="text-gray-500 hover:text-red-600"><X className="w-4 h-4" /></button>
                  </div>
                )}
                
                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                  <button onClick={handleConfirmReplace} disabled={!file || isReplacing || hasPending} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center">
                    {isReplacing && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
                    {isReplacing ? "Replacing..." : "Replace"}
                  </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default ReplaceDocumentModal;
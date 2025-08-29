import React, { useState, useCallback } from "react";
import {
  useGetLegalDocuments,
  useUploadDocument,
  useDeleteDocument,
  useDeleteMultipleDocuments,
} from "./hooks/useLegalDocuments";
import {
  Loader2,
  Trash2,
  UploadCloud,
  FileText,
  X,
  FileImage,
  CheckCircle2, 
  AlertCircle,
  Clock,
  Eye,   
} from "lucide-react";
import toast from "react-hot-toast";

// Ganti nama komponen menjadi PascalCase
export default function UploadPage() {
  // State untuk file yang akan diupload dan status drag
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Hooks dari React Query untuk interaksi API
  const {
    data: documents,
    isLoading: isLoadingDocs,
    isError,
  } = useGetLegalDocuments();
  const { mutate: uploadFiles, isPending: isUploading } =
    useUploadDocument(setUploadProgress);
  const { mutate: deleteFile } = useDeleteDocument();
  const { mutate: deleteMultiple, isPending: isDeletingMultiple } =
    useDeleteMultipleDocuments();

  // --- Event Handlers ---
  const handleFileSelect = (selectedFiles) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword", // untuk .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // untuk .docx
      "image/jpeg", // untuk .jpg dan .jpeg
      "image/png", // untuk .png
    ];
    const newFiles = Array.from(selectedFiles).filter((file) =>
      allowedTypes.includes(file.type)
    );
    if (newFiles.length !== selectedFiles.length) {
      toast.error(
        "Beberapa file tidak didukung. Hanya Word, PDF, JPG, & PNG yang diizinkan."
      );
    }
    setFilesToUpload((prev) => [...prev, ...newFiles]);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  const removeFile = (fileName) => {
    setFilesToUpload((prev) => prev.filter((f) => f.name !== fileName));
  };

  const handleUpload = () => {
    if (filesToUpload.length === 0) return;
    // Set progress ke 0 saat mulai
    setUploadProgress(0); 

    uploadFiles({ files: filesToUpload, onProgress: setUploadProgress }, {
      onSuccess: () => {
        setFilesToUpload([]); // Kosongkan daftar file setelah berhasil
        // Reset progress setelah beberapa saat agar user bisa melihat 100%
        setTimeout(() => setUploadProgress(0), 1000); 
      },
      onError: () => {
         // Reset progress jika error
        setUploadProgress(0);
      }
    });
  };

  const handleDelete = (docId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) {
      deleteFile(docId);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Pilih semua ID dokumen yang ada
      const allDocIds = documents.map((doc) => doc.id);
      setSelectedDocs(allDocIds);
    } else {
      // Kosongkan pilihan
      setSelectedDocs([]);
    }
  };

  const handleSelectOne = (e, docId) => {
    if (e.target.checked) {
      // Tambahkan ID ke array
      setSelectedDocs((prev) => [...prev, docId]);
    } else {
      // Hapus ID dari array
      setSelectedDocs((prev) => prev.filter((id) => id !== docId));
    }
  };

  const handleMultipleDelete = () => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus ${selectedDocs.length} dokumen terpilih?`
      )
    ) {
      deleteMultiple(selectedDocs, {
        onSuccess: () => {
          setSelectedDocs([]); // Kosongkan state setelah berhasil
        },
      });
    }
  };

  const getFileIcon = (fileName) => {
    if (
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png")
    ) {
      return <FileImage className="w-5 h-5 text-purple-500" />;
    }
    // Asumsikan sisanya adalah dokumen
    return <FileText className="w-5 h-5 text-red-500" />;
  };

  const getStatusComponent = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Selesai</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 animate-pulse"><Clock className="w-3 h-3 mr-1" /> Memproses</span>;
      case 'failed':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" /> Gagal</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <>
      <div className="text-gray-500 text-md">
        Halaman ini digunakan untuk mengunggah dokumen legal yang akan digunakan
        sebagai basis pengetahuan.
      </div>

      {/* --- Bagian Upload --- */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center transition-colors duration-300 ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          <input
            type="file"
            id="file-input"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
          />
          <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600">
            Tarik dokumen ke sini, atau{" "}
            <label
              htmlFor="file-input"
              className="text-blue-600 font-semibold cursor-pointer hover:underline"
            >
              pilih file
            </label>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Mendukung: PDF, DOC, DOCX, JPG, PNG.
          </p>
        </div>

        {/* --- Daftar File Siap Upload --- */}
        {filesToUpload.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="font-semibold text-gray-700">File siap diunggah:</h3>
            {filesToUpload.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  {getFileIcon(file.name.toLowerCase())}
                  <span className="text-sm text-gray-800">{file.name}</span>
                </div>
                <button
                  onClick={() => removeFile(file.name)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 3. Tampilkan Progress Bar jika sedang mengunggah */}
        {isUploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-center mt-1 text-gray-600">
              {uploadProgress}%
            </p>
          </div>
        )}

        <div className="flex justify-start mt-6">
          <button
            onClick={handleUpload}
            disabled={filesToUpload.length === 0 || isUploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Mengunggah...
              </>
            ) : (
              <>
                <UploadCloud className="h-5 w-5 mr-2" />
                Upload ({filesToUpload.length})
              </>
            )}
          </button>
        </div>
      </div>

      {/* --- Tabel Dokumen Terunggah --- */}
            {/* --- Tabel Dokumen Terunggah (diperbarui) --- */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Dokumen Tersimpan</h2>
          {selectedDocs.length > 0 && (
            <button onClick={handleMultipleDelete} disabled={isDeletingMultiple} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center disabled:bg-gray-400">
              {isDeletingMultiple ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Trash2 className="h-5 w-5 mr-2" />}
              Hapus ({selectedDocs.length})
            </button>
          )}
        </div>

        <div className="relative overflow-x-auto max-h-[580px] overflow-y-auto">
          <table className="w-full text-sm text-left text-gray-500 table-fixed">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-4 w-1/24"><input type="checkbox" onChange={handleSelectAll} checked={documents && documents.length > 0 && selectedDocs.length === documents.length} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"/></th>
                <th className="px-6 py-4 w-1/12">Tanggal Unggah</th>
                <th className="px-6 py-4 w-4/12">Nama Dokumen</th>
                <th className="px-6 py-4 w-2/12">Tipe</th>
                <th className="px-6 py-4 w-1/12">Staff</th>
                <th className="px-6 py-4 w-1/12">Tim</th>
                <th className="px-6 py-4 w-1/12">Status</th>
                <th className="px-6 py-4 w-1/12 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingDocs ? ( <tr><td colSpan="8" className="text-center py-4"><Loader2 className="animate-spin inline-block" /></td></tr> )
               : isError ? ( <tr><td colSpan="8" className="text-center py-4 text-red-500">Gagal memuat data.</td></tr> )
               : documents && documents.length > 0 ? (
                documents.map((doc) => (
                  <tr key={doc.id} className="bg-white border-b hover:bg-gray-50 border-gray-200">
                    <td className="px-4 py-4"><input type="checkbox" onChange={(e) => handleSelectOne(e, doc.id)} checked={selectedDocs.includes(doc.id)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"/></td>
                    <td className="px-6 py-4">{new Date(doc.upload_date).toLocaleDateString("id-ID")}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 break-words">{doc.document_name}</td>
                    <td className="px-6 py-4">{doc.document_type}</td>
                    <td className="px-6 py-4">{doc.staff}</td>
                    <td className="px-6 py-4">{doc.team}</td>
                    <td className="px-6 py-4">{getStatusComponent(doc.status)}</td>
                    <td className="px-6 py-4 flex justify-center gap-2">
                      <a href={`${import.meta.env.VITE_API_URL_GENERAL}/public${doc.file_path}`} target="_blank" rel="noopener noreferrer" className={`font-medium text-blue-600 hover:underline ${doc.status !== 'completed' && 'pointer-events-none text-gray-400'}`}><Eye className="w-4 h-4"/></a>
                      <button onClick={() => handleDelete(doc.id)} className="font-medium text-red-600 hover:underline"><Trash2 className="w-4 h-4"/></button>
                    </td>
                  </tr>
                ))
              ) : ( <tr><td colSpan="8" className="text-center py-4">Belum ada dokumen yang diunggah.</td></tr> )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

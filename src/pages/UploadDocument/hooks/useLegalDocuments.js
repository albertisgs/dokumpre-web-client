import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';
import toast from 'react-hot-toast';

// --- fetchLegalDocuments (Tidak berubah) ---
const fetchLegalDocuments = async () => {
  const response = await axiosInstance.generalSession.get('/api/legal-documents/');
  return response.data.sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date));
};

export const useGetLegalDocuments = () => {
  return useQuery({
    queryKey: ['legalDocuments'],
    queryFn: fetchLegalDocuments,
  });
};

// --- PERUBAHAN DI SINI ---
// Fungsi ini sekarang menerima objek yang berisi 'files' dan callback 'onProgress'
const uploadDocumentsBatch = async ({ files, onProgress }) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  // Tambahkan kembali konfigurasi onUploadProgress
  const response = await axiosInstance.generalSession.post(
    '/api/legal-documents/upload', 
    formData, 
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        // Kalkulasi persentase
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // Panggil callback untuk update UI
        if (onProgress) {
          onProgress(percentCompleted);
        }
      },
    }
  );
  return response.data;
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadDocumentsBatch,
    onSuccess: (data) => {
      toast.success(data.message || 'Files sent for processing!');
      queryClient.invalidateQueries({ queryKey: ['legalDocuments'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Gagal memulai proses unggah.');
    },
  });
};

// --- Sisanya tidak berubah ---
const deleteDocument = async (docId) => {
  const response = await axiosInstance.generalSession.delete(`/api/legal-documents/${docId}`);
  return response.data;
};

export const useDeleteDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteDocument,
        onSuccess: () => {
            toast.success('Dokumen berhasil dihapus.');
            queryClient.invalidateQueries({ queryKey: ['legalDocuments'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Gagal menghapus dokumen.');
        }
    });
};

const deleteMultipleDocuments = async (docIds) => {
  const response = await axiosInstance.generalSession.post('/api/legal-documents/delete-multiple', {
    doc_ids: docIds,
  });
  return response.data;
};

export const useDeleteMultipleDocuments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMultipleDocuments,
    onSuccess: (data) => {
      toast.success(data.message || 'Dokumen terpilih berhasil dihapus.');
      queryClient.invalidateQueries({ queryKey: ['legalDocuments'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus dokumen.');
    },
  });
};
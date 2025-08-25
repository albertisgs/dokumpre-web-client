import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';
import toast from 'react-hot-toast';

// --- 1. Fetch semua dokumen ---
const fetchLegalDocuments = async () => {
  const response = await axiosInstance.generalSession.get('/api/legal-documents/');
  // Sortir data terbaru di atas
  return response.data.sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date));
};

export const useGetLegalDocuments = () => {
  return useQuery({
    queryKey: ['legalDocuments'],
    queryFn: fetchLegalDocuments,
  });
};


// --- 2. Upload dokumen baru ---
const uploadDocument = async ({ file, onUploadProgress }) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.generalSession.post(
    '/api/legal-documents/upload', 
    formData, 
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onUploadProgress
    }
  );
  return response.data;
};

export const useUploadDocument = (setUploadProgress) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file) => {
      // Buat fungsi callback untuk dioper ke axios
      const onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted); // Perbarui state progres di komponen
      };
      return uploadDocument({ file, onUploadProgress });
    },
    onSuccess: (data) => {
      toast.success(`Dokumen "${data.document.document_name}" berhasil diunggah!`);
      queryClient.invalidateQueries({ queryKey: ['legalDocuments'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal mengunggah dokumen.');
    },
    onSettled: () => {
      // Reset progres menjadi 0 setelah selesai (baik sukses maupun gagal)
      setTimeout(() => setUploadProgress(0), 1000);
    }
  });
};


// --- 3. Hapus dokumen ---
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

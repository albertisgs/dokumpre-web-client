import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';
import toast from 'react-hot-toast';

// --- Mengambil daftar gambar yang sudah diproses ---
const fetchImageExtractions = async () => {
  const response = await axiosInstance.generalSession.get('/api/extract-image/');
  // Urutkan berdasarkan tanggal unggah terbaru
  return response.data.sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date));
};

export const useGetImageExtractions = () => {
  return useQuery({
    queryKey: ['imageExtractions'],
    queryFn: fetchImageExtractions,
  });
};

// --- Mengunggah file gambar untuk konversi ---
const uploadImages = async ({ files, onProgress }) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await axiosInstance.generalSession.post(
    '/api/extract-image/upload', 
    formData, 
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) {
          onProgress(percentCompleted);
        }
      },
    }
  );
  return response.data;
};

export const useUploadImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadImages,
    onSuccess: (data) => {
      toast.success(data.message || 'Gambar telah dikirim untuk diproses!');
      queryClient.invalidateQueries({ queryKey: ['imageExtractions'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Gagal memulai proses unggah.');
    },
  });
};

// --- Menghapus satu data ekstraksi ---
const deleteImageExtraction = async (docId) => {
  const response = await axiosInstance.generalSession.delete(`/api/extract-image/${docId}`);
  return response.data;
};

export const useDeleteImageExtraction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteImageExtraction,
        onSuccess: () => {
            toast.success('Data ekstraksi berhasil dihapus.');
            queryClient.invalidateQueries({ queryKey: ['imageExtractions'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Gagal menghapus data.');
        }
    });
};

// --- Menghapus beberapa data ekstraksi sekaligus ---
const deleteMultipleImageExtractions = async (docIds) => {
  // Backend Anda mungkin memerlukan endpoint terpisah untuk ini,
  // untuk saat ini, kita akan menghapusnya satu per satu.
  // Jika ada endpoint bulk delete, logikanya akan mirip dengan useLegalDocuments.
  const deletePromises = docIds.map(id => deleteImageExtraction(id));
  return Promise.all(deletePromises);
};

export const useDeleteMultipleImageExtractions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMultipleImageExtractions,
    onSuccess: () => {
      toast.success('Data terpilih berhasil dihapus.');
      queryClient.invalidateQueries({ queryKey: ['imageExtractions'] });
    },
    onError: () => {
      toast.error('Gagal menghapus beberapa data.');
    },
  });
};
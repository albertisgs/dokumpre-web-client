// src/pages/AgentDashboard/hooks/useChatHistory.js (File Baru)
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../axios/axiosInstance';

// Fungsi untuk mengambil daftar riwayat
const fetchHistoryList = async () => {
    const { data } = await axiosInstance.generalSession.get('/api/live-chat/agent/history');
    return data;
};

// Fungsi untuk mengambil detail transkrip
const fetchTranscript = async (sessionId) => {
    if (!sessionId) return null;
    const { data } = await axiosInstance.generalSession.get(`/api/live-chat/agent/history/${sessionId}`);
    return data;
};

// Hook untuk daftar riwayat
export const useGetHistoryList = () => {
    return useQuery({
        queryKey: ['agentChatHistory'],
        queryFn: fetchHistoryList,
    });
};

// Hook untuk detail transkrip (berdasarkan ID yang dipilih)
export const useGetTranscript = (sessionId) => {
    return useQuery({
        queryKey: ['agentTranscript', sessionId],
        queryFn: () => fetchTranscript(sessionId),
        enabled: !!sessionId, // Hanya berjalan jika sessionId ada
    });
};
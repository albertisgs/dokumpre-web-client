// src/hooks/useAgentData.js (File Baru)
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../axios/axiosInstance';
import { useAuth } from '../../context/hooks/useAuth';



// API function untuk mengambil data queue
const fetchQueue = async () => {
    const { data } = await axiosInstance.generalSession.get('/api/live-chat/agent/queue');
    return data;
};

// API function untuk mengambil sesi aktif
const fetchMyActiveSession = async () => {
    const { data } = await axiosInstance.generalSession.get('/api/live-chat/agent/my-session');
    // Kita hanya butuh tahu apakah ada sesi atau tidak (untuk angka '1' atau '0')
    return data ? [data] : []; 
};

// API function untuk mengambil riwayat (hanya untuk hitungan)
const fetchHistory = async () => {
    // Kita hanya perlu jumlahnya, jadi kita bisa minta limit=1 untuk efisiensi
    const { data } = await axiosInstance.generalSession.get('/api/live-chat/agent/history?limit=1'); 
    // Di masa depan, backend bisa dibuatkan endpoint khusus untuk count
    return data;
};


export const useAgentData = () => {
    const { authState } = useAuth();
    const hasAgentPermission = authState.user?.permissions?.includes("agent-dashboard:access");

    // Query untuk antrian
    const { data: queue = [] } = useQuery({
        queryKey: ['chatQueue'],
        queryFn: fetchQueue,
        enabled: hasAgentPermission, // Hanya aktifkan jika punya izin
        refetchInterval: 15000, // Refresh setiap 15 detik
    });
    
    // Query untuk sesi aktif
    const { data: activeSessions = [] } = useQuery({
        queryKey: ['myActiveSession'],
        queryFn: fetchMyActiveSession,
        enabled: hasAgentPermission,
        refetchInterval: 15000,
    });
    
    // Query untuk riwayat
    const { data: history = [] } = useQuery({
        queryKey: ['agentChatHistory'],
        queryFn: fetchHistory,
        enabled: hasAgentPermission,
    });

    return {
        queueCount: queue.length,
        activeCount: activeSessions.length,
        // Untuk historyCount, kita perlu menunggu backend menyediakan total count.
        // Untuk sekarang, kita bisa asumsikan dari data yang ada.
        historyCount: history.length, // Ini perlu disempurnakan di backend nantinya
        agentName: authState.user?.name,
        // Kita juga bisa tambahkan status online/offline di sini nanti
    };
};
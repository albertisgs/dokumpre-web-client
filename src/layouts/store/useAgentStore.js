// src/store/useAgentStore.js (File Baru)
import { create } from 'zustand';

import toast from 'react-hot-toast';
import axiosInstance from '../../axios/axiosInstance';

// Fungsi-fungsi API yang akan dipanggil oleh store
const api = {
    fetchQueue: () => axiosInstance.generalSession.get('/api/live-chat/agent/queue'),
    fetchMyActiveSession: () => axiosInstance.generalSession.get('/api/live-chat/agent/my-session'),
    fetchHistory: () => axiosInstance.generalSession.get('/api/live-chat/agent/history'),
    claimChat: (sessionId) => axiosInstance.generalSession.post(`/api/live-chat/agent/sessions/${sessionId}/claim`),
    endSession: (sessionId) => axiosInstance.generalSession.post(`/api/live-chat/agent/sessions/${sessionId}/resolve`),
    // **[FOKUS 1]** Tambahkan API call untuk update status
    updateAgentStatus: (status) => axiosInstance.generalSession.put('/api/live-chat/agent/status', { status }),
};

// **[FOKUS 2]** Variabel untuk memastikan listener hanya di-setup sekali
let presenceInitialized = false;

export const useAgentStore = create((set, get) => ({
    // --- STATE ---
    queue: [],
    activeChat: null,
    history: [],
    agentStatus: 'offline',
    isInitialized: false,

    // --- ACTIONS ---
    
    // Inisialisasi dan fetch data awal
    initialize: async () => {
        if (get().isInitialized) return;
        try {
            const [queueRes, activeChatRes, historyRes] = await Promise.all([
                api.fetchQueue(),
                api.fetchMyActiveSession(),
                api.fetchHistory()
            ]);
            set({
                queue: queueRes.data,
                activeChat: activeChatRes.data,
                history: historyRes.data,
                isInitialized: true,
                agentStatus: 'online', // Set online saat berhasil inisialisasi
            });
        } catch (error) {
            console.error("Failed to initialize agent data:", error);
            set({ isInitialized: true }); // Tetap set initialized agar tidak coba lagi
        }
    },

    // Aksi untuk mengklaim chat dari antrian
    claimChat: async (sessionId) => {
        try {
            const { data: claimedSession } = await api.claimChat(sessionId);
            set({ activeChat: claimedSession });
            get().fetchQueue(); // Refresh antrian setelah klaim
            toast.success(`Terhubung dengan ${claimedSession.user_name}`);
            return claimedSession; // Kembalikan data untuk navigasi
        } catch (error) {
            toast.error(error.response?.data?.detail || "Gagal mengklaim chat.");
            get().fetchQueue(); // Refresh antrian jika gagal (mungkin sudah diambil orang lain)
            throw error;
        }
    },

    // Aksi untuk menyelesaikan sesi
    endSession: async (sessionId) => {
        try {
            const { data } = await api.endSession(sessionId);
            set({ activeChat: null });
            get().fetchHistory(); // Refresh riwayat setelah sesi selesai
            toast.success(data.message || 'Sesi berhasil diselesaikan.');
        } catch (error) {
            toast.error(error.response?.data?.detail || "Gagal menyelesaikan sesi.");
            throw error;
        }
    },

    // Aksi untuk merefresh data secara manual (jika dibutuhkan)
    fetchQueue: async () => {
        const { data } = await api.fetchQueue();
        set({ queue: data });
    },
    fetchHistory: async () => {
        const { data } = await api.fetchHistory();
        set({ history: data });
    },

     // **[FOKUS 3]** Action baru untuk mengubah status secara manual atau otomatis
    changeStatus: async (newStatus) => {
        // Hanya kirim API call jika status benar-benar berubah
        if (get().agentStatus === newStatus) return;

        try {
            const { data } = await api.updateAgentStatus(newStatus);
            set({ agentStatus: data.new_status });
            if (newStatus !== 'offline') {
                toast.success(`Status Anda sekarang: ${data.new_status}`, { duration: 2000 });
            }
        } catch (error) {
            toast.error(error.response?.data?.detail || "Gagal mengubah status.");
        }
    },

    // **[FOKUS 4]** Action untuk mengelola semua event listener kehadiran
    managePresence: () => {
        if (presenceInitialized) return; // Jangan setup listener lebih dari sekali

        const store = get();

        // 1. Set status ONLINE saat pertama kali dipanggil
        store.changeStatus('online');

        // 2. Handler untuk mengubah status saat tab visibility berubah
        const handleVisibilityChange = () => {
            const currentStatus = get().agentStatus;
            if (document.hidden && currentStatus === 'online') {
                store.changeStatus('away');
            } else if (!document.hidden && currentStatus === 'away') {
                store.changeStatus('online');
            }
        };

        // 3. Handler untuk mengubah status OFFLINE saat tab ditutup
        const handleBeforeUnload = () => {
            // Gunakan sendBeacon untuk pengiriman yang andal saat halaman ditutup
            if (navigator.sendBeacon) {
                const url = `${import.meta.env.VITE_API_URL_GENERAL}/api/live-chat/agent/status`;
                const blob = new Blob([JSON.stringify({ status: 'offline' })], { type: 'application/json' });
                navigator.sendBeacon(url, blob);
            }
        };

        // Tambahkan event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        presenceInitialized = true;
        
        // Return fungsi cleanup untuk dipanggil saat tidak lagi dibutuhkan
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            presenceInitialized = false;
        };
    }
}));
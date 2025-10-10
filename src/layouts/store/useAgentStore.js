import { create } from 'zustand';
import toast from 'react-hot-toast';
import axiosInstance from '../../axios/axiosInstance';
import Pusher from 'pusher-js';

// --- API Functions ---
const api = {
    fetchQueue: () => axiosInstance.generalSession.get('/api/live-chat/agent/queue'),
    fetchPending: () => axiosInstance.generalSession.get('/api/live-chat/agent/pending'),
    fetchMyActiveSession: () => axiosInstance.generalSession.get('/api/live-chat/agent/my-sessions'),
    fetchHistoryList: () => axiosInstance.generalSession.get('/api/live-chat/agent/history'),
    claimChat: (sessionId) => axiosInstance.generalSession.post(`/api/live-chat/agent/sessions/${sessionId}/claim`),
    endSession: (sessionId) => axiosInstance.generalSession.post(`/api/live-chat/agent/sessions/${sessionId}/resolve`),
    updateAgentStatus: (status) => axiosInstance.generalSession.put('/api/live-chat/agent/status', { status }),
    postAgentMessage: (sessionId, text) => axiosInstance.generalSession.post(`/api/live-chat/agent/sessions/${sessionId}/send-message`, { message_text: text }),
    fetchTranscript: (sessionId) => axiosInstance.generalSession.get(`/api/live-chat/agent/history/${sessionId}`)
};

// --- Pusher Helper ---
let pusherInstance = null;
let presenceInitialized = false;
const subscribedChannels = new Set();

const getPusherInstance = () => {
    if (!pusherInstance) {
        const key = import.meta.env.VITE_PUSHER_KEY;
        const cluster = import.meta.env.VITE_PUSHER_CLUSTER;
        if (key && cluster) {
            pusherInstance = new Pusher(key, { cluster });
        }
    }
    return pusherInstance;
};

// --- Zustand Store ---
export const useAgentStore = create((set, get) => ({
    queue: [],
    pending: [],
    history: [],
    
    // --- STATE TELAH DIUBAH UNTUK MULTI-CHAT ---
    activeChats: [],        // Menggantikan activeChat: null
    selectedChatId: null,   // Untuk melacak chat aktif yang sedang dibuka
    // ---------------------------------------------

    agentStatus: 'offline',
    isInitialized: false,
    selectedHistoryTranscript: null,
    isTranscriptLoading: false,

    _mergeChatHistory: (sessionData) => {
        if (!sessionData) return null;
        const allMessages = [
            ...(sessionData.history || []), 
            ...(sessionData.messages || [])
        ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        return { ...sessionData, allMessages };
    },

    initialize: async () => {
        if (get().isInitialized) return;
        try {
            // NOTE: fetchMyActiveSession idealnya mengembalikan array jika agen bisa memiliki sesi aktif saat login.
            // Untuk saat ini, kita asumsikan mulai dari nol untuk kesederhanaan.
            const [queueRes, pendingRes, activeSessionsRes, historyRes] = await Promise.all([
                api.fetchQueue(), 
                api.fetchPending(),
                api.fetchMyActiveSession(), // Ini mungkin perlu diubah di backend
                api.fetchHistoryList()
            ]);

            let initialActiveChats = [];
            if (activeSessionsRes.data) {
                // Jika API hanya mengembalikan satu objek, bungkus dalam array
                const sessions = Array.isArray(activeSessionsRes.data) ? activeSessionsRes.data : [activeSessionsRes.data];
                initialActiveChats = sessions.map(session => get()._mergeChatHistory(session));
            }
            
            set({
                queue: queueRes.data,
                pending: pendingRes.data,
                activeChats: initialActiveChats,
                history: historyRes.data,
                isInitialized: true
            });
            get().setupPusherListeners();
        } catch (error) {
            console.error("Gagal menginisialisasi data agen:", error);
            set({ isInitialized: true, activeChats: [] });
        }
    },
    
    claimChat: async (sessionId) => {
        try {
            const { data: claimedSession } = await api.claimChat(sessionId);
            const newActiveChat = get()._mergeChatHistory(claimedSession);

            set(state => ({
                // Tambahkan chat baru ke dalam array activeChats
                activeChats: [...state.activeChats, newActiveChat],
                // Otomatis pilih chat yang baru diklaim
                selectedChatId: newActiveChat.id,
                selectedHistoryTranscript: null
            }));

            get().fetchQueue();
            get().fetchPending();
            get().setupPusherListeners(); // Panggil untuk subscribe ke channel baru
            toast.success(`Terhubung dengan ${newActiveChat.user_name}`);
            return newActiveChat;
        } catch (error) {
            toast.error(error.response?.data?.detail || "Gagal mengklaim obrolan.");
            get().fetchQueue();
            get().fetchPending();
            throw error;
        }
    },

    sendMessage: async (sessionId, text, agentId) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage = { id: tempId, session_id: sessionId, sender_id: agentId, sender_type: 'agent', message_text: text, timestamp: new Date().toISOString() };
        
        // Perbarui pesan di chat yang benar dalam array activeChats
        set(state => ({
            activeChats: state.activeChats.map(chat => 
                chat.id === sessionId 
                ? { ...chat, allMessages: [...(chat.allMessages || []), optimisticMessage] } 
                : chat
            )
        }));

        try {
            await api.postAgentMessage(sessionId, text);
        } catch (error) {
            toast.error("Gagal mengirim pesan.");
            // Hapus pesan optimistis jika pengiriman gagal
            set(state => ({
                activeChats: state.activeChats.map(chat =>
                    chat.id === sessionId
                    ? { ...chat, allMessages: chat.allMessages.filter(msg => msg.id !== tempId) }
                    : chat
                )
            }));
        }
    },

    endSession: async (sessionId) => {
        try {
            const { data } = await api.endSession(sessionId);
            set(state => ({
                // Hapus sesi dari array activeChats
                activeChats: state.activeChats.filter(chat => chat.id !== sessionId),
                // Jika sesi yang ditutup sedang aktif, reset pilihan
                selectedChatId: state.selectedChatId === sessionId ? null : state.selectedChatId,
                selectedHistoryTranscript: null
            }));
            get().fetchHistory();
            toast.success(data.message || 'Sesi berhasil diselesaikan.');
        } catch (error) {
            toast.error(error.response?.data?.detail || "Gagal menyelesaikan sesi.");
            throw error;
        }
    },

    fetchHistoryTranscript: async (sessionId) => {
        set({ isTranscriptLoading: true, selectedHistoryTranscript: null });
        try {
            const { data } = await api.fetchTranscript(sessionId);
            set({ selectedHistoryTranscript: data, isTranscriptLoading: false, selectedChatId: null });
        } catch (error) {
            toast.error("Gagal memuat transkrip.");
            set({ isTranscriptLoading: false });
        }
    },

    // --- AKSI BARU UNTUK MENGELOLA UI ---
    selectActiveChat: (sessionId) => {
        set({
            selectedChatId: sessionId,
            selectedHistoryTranscript: null // Membersihkan tampilan riwayat
        });
    },

    clearSelectedTranscript: () => {
        set({ selectedHistoryTranscript: null });
    },
    // ------------------------------------
    
    setupPusherListeners: () => {
        const pusher = getPusherInstance();
        if (!pusher) return;

        // Unsubscribe dari channel yang tidak aktif lagi
        const activeChannelNames = new Set(get().activeChats.map(c => `chat-session-${c.id}`));
        activeChannelNames.add('agent-dashboard');

        subscribedChannels.forEach(channelName => {
            if (!activeChannelNames.has(channelName)) {
                pusher.unsubscribe(channelName);
                subscribedChannels.delete(channelName);
            }
        });

        // Subscribe ke channel dashboard (selalu)
        if (!subscribedChannels.has('agent-dashboard')) {
            const dashboardChannel = pusher.subscribe('agent-dashboard');
            dashboardChannel.bind('session-claimed', () => get().fetchQueue());
            dashboardChannel.bind('new-pending-session', () => get().fetchQueue());
            subscribedChannels.add('agent-dashboard');
        }

        // Subscribe ke setiap channel sesi aktif
        get().activeChats.forEach(chat => {
            const channelName = `chat-session-${chat.id}`;
            if (!subscribedChannels.has(channelName)) {
                const channel = pusher.subscribe(channelName);
                channel.bind('new_message', (newMessage) => {
                    set(state => {
                        const targetChat = state.activeChats.find(c => c.id === newMessage.session_id);
                        if (targetChat) {
                            const messageExists = targetChat.allMessages.some(msg => msg.id === newMessage.id);
                            if (!messageExists) {
                                const updatedMessages = [...targetChat.allMessages.filter(msg => !String(msg.id).startsWith('temp-')), newMessage]
                                    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                                
                                return {
                                    activeChats: state.activeChats.map(c => 
                                        c.id === newMessage.session_id 
                                        ? { ...c, allMessages: updatedMessages } 
                                        : c
                                    )
                                };
                            }
                        }
                        return state;
                    });
                });
                subscribedChannels.add(channelName);
            }
        });
    },
    
    fetchQueue: async () => {
        const { data } = await api.fetchQueue();
        set({ queue: data });
    },
    fetchPending: async () => {
        const { data } = await api.fetchPending();
        set({ pending: data });
    },
    fetchHistory: async () => {
        const { data } = await api.fetchHistoryList();
        set({ history: data });
    },
    changeStatus: async (newStatus) => {
       if (get().agentStatus === newStatus) return;
        try {
            const { data } = await api.updateAgentStatus(newStatus);
            set({ agentStatus: data.new_status });
        } catch (error) {
            toast.error(error.response?.data?.detail || "Gagal mengubah status.");
        }
    },
    
    managePresence: () => {
        if (presenceInitialized) return;
        const store = get();
        store.changeStatus('online');

        const handleVisibilityChange = () => {
            const currentStatus = get().agentStatus;
            if (document.hidden && currentStatus === 'online') {
                store.changeStatus('away');
            } else if (!document.hidden && currentStatus === 'away') {
                store.changeStatus('online');
            }
        };

        const handleBeforeUnload = () => {
            if (navigator.sendBeacon) {
                const url = `${import.meta.env.VITE_API_URL_GENERAL}/api/live-chat/agent/status`;
                const blob = new Blob([JSON.stringify({ status: 'offline' })], { type: 'application/json' });
                navigator.sendBeacon(url, blob);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);
        presenceInitialized = true;
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            presenceInitialized = false;
        };
    }
}));
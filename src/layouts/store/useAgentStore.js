import { create } from 'zustand';
import toast from 'react-hot-toast';
import axiosInstance from '../../axios/axiosInstance';
import Pusher from 'pusher-js';

// --- API Functions ---
const api = {
    fetchQueue: () => axiosInstance.generalSession.get('/api/live-chat/agent/queue'),
    fetchMyActiveSession: () => axiosInstance.generalSession.get('/api/live-chat/agent/my-session'),
    fetchHistoryList: () => axiosInstance.generalSession.get('/api/live-chat/agent/history'),
    claimChat: (sessionId) => axiosInstance.generalSession.post(`/api/live-chat/agent/sessions/${sessionId}/claim`),
    endSession: (sessionId) => axiosInstance.generalSession.post(`/api/live-chat/agent/sessions/${sessionId}/resolve`),
    updateAgentStatus: (status) => axiosInstance.generalSession.put('/api/live-chat/agent/status', { status }),
    postAgentMessage: (sessionId, text) => axiosInstance.generalSession.post(`/api/live-chat/agent/sessions/${sessionId}/send-message`, { message_text: text }),
    fetchTranscript: (sessionId) => axiosInstance.generalSession.get(`/api/live-chat/agent/history/${sessionId}`)
};

// --- Pusher Helper ---
let pusherInstance = null;
let presenceInitialized=false
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

const subscribe = (channelName, eventName, callback) => {
    const pusher = getPusherInstance();
    if (pusher) {
        const channel = pusher.subscribe(channelName);
        channel.bind(eventName, callback);
        subscribedChannels.add(channelName);
    }
};

const unsubscribeAll = () => {
    const pusher = getPusherInstance();
    if (pusher) {
        subscribedChannels.forEach(channelName => {
            pusher.unsubscribe(channelName);
        });
        subscribedChannels.clear();
    }
};

// --- Zustand Store ---
export const useAgentStore = create((set, get) => ({
    queue: [],
    activeChat: null,
    history: [],
    agentStatus: 'offline',
    isInitialized: false,
    selectedHistoryTranscript: null,
    isTranscriptLoading: false,

    // Fungsi untuk menggabungkan riwayat dan pesan
    _mergeChatHistory: (sessionData) => {
        if (!sessionData) return null;
        
        // Memastikan riwayat dari chatbot (history) dan pesan live (messages) digabung dan diurutkan
        const allMessages = [
            ...(sessionData.history || []), 
            ...(sessionData.messages || [])
        ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // Mengembalikan objek sesi yang baru dengan array `allMessages`
        return { ...sessionData, allMessages };
    },

     initialize: async () => {
        if (get().isInitialized) return;
        try {
            const [queueRes, activeChatRes, historyRes] = await Promise.all([
                api.fetchQueue(),
                api.fetchMyActiveSession(),
                api.fetchHistoryList()
            ]);

            // Gunakan fungsi _mergeChatHistory untuk memproses sesi yang aktif saat inisialisasi
            const chatWithHistory = get()._mergeChatHistory(activeChatRes.data);
            console.log(chatWithHistory)
            set({
                queue: queueRes.data,
                activeChat: chatWithHistory,
                history: historyRes.data,
                isInitialized: true
            });
            get().setupPusherListeners();
        } catch (error) {
            console.error("Gagal menginisialisasi data agen:", error);
            set({ isInitialized: true });
        }
    },
    
    claimChat: async (sessionId) => {
        try {
            const { data: claimedSession } = await api.claimChat(sessionId);
            
            // Gunakan fungsi _mergeChatHistory untuk memproses sesi yang baru diklaim
            const newActiveChat = get()._mergeChatHistory(claimedSession);

            set({ activeChat: newActiveChat, selectedHistoryTranscript: null });
            get().fetchQueue();
            get().setupPusherListeners();
            toast.success(`Terhubung dengan ${newActiveChat.user_name}`);
            return newActiveChat;
        } catch (error) {
            toast.error(error.response?.data?.detail || "Gagal mengklaim obrolan.");
            get().fetchQueue();
            throw error;
        }
    },

    sendMessage: async (sessionId, text, agentId) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage = { id: tempId, session_id: sessionId, sender_id: agentId, sender_type: 'agent', message_text: text, timestamp: new Date().toISOString() };
        
        set(state => ({
            activeChat: state.activeChat ? { ...state.activeChat, allMessages: [...(state.activeChat.allMessages || []), optimisticMessage] } : null
        }));

        try {
            await api.postAgentMessage(sessionId, text);
        } catch (error) {
            toast.error("Gagal mengirim pesan.");
            set(state => ({
                activeChat: state.activeChat ? { ...state.activeChat, allMessages: state.activeChat.allMessages.filter(msg => msg.id !== tempId) } : null
            }));
        }
    },

    fetchHistoryTranscript: async (sessionId) => {
        set({ isTranscriptLoading: true, activeChat: null, selectedHistoryTranscript: null });
        try {
            const { data } = await api.fetchTranscript(sessionId);
            set({ selectedHistoryTranscript: data, isTranscriptLoading: false });
        } catch (error) {
            toast.error("Gagal memuat transkrip.");
            set({ isTranscriptLoading: false });
        }
    },
    
    setupPusherListeners: () => {
        unsubscribeAll();
        const pusher = getPusherInstance();
        if (!pusher) return;

        subscribe('agent-dashboard', 'new-pending-session', () => get().fetchQueue());
        subscribe('agent-dashboard', 'session-claimed', () => get().fetchQueue());

        const activeChat = get().activeChat;
        if (activeChat) {
            subscribe(`chat-session-${activeChat.id}`, 'new_message', (newMessage) => {
                set(state => {
                    const currentChat = state.activeChat;
                    if (currentChat && currentChat.id === newMessage.session_id) {
                        const messageExists = currentChat.allMessages.some(msg => msg.id === newMessage.id);
                        if (!messageExists) {
                            const updatedMessages = [...currentChat.allMessages.filter(msg => !String(msg.id).startsWith('temp-')), newMessage].sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
                            return { activeChat: { ...currentChat, allMessages: updatedMessages } };
                        }
                    }
                    return state;
                });
            });
        }
    },
    
    // Sisa actions (endSession, changeStatus, dll.) tetap sama
    endSession: async (sessionId) => {
        try {
            const { data } = await api.endSession(sessionId);
            set({ activeChat: null, selectedHistoryTranscript: null });
            get().fetchHistory();
            toast.success(data.message || 'Sesi berhasil diselesaikan.');
        } catch (error) {
            toast.error(error.response?.data?.detail || "Gagal menyelesaikan sesi.");
            throw error;
        }
    },
    fetchQueue: async () => {
        const { data } = await api.fetchQueue();
        set({ queue: data });
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
            // if (newStatus !== 'offline') {
            //     toast.success(`Status Anda sekarang: ${data.new_status}`, { duration: 2000 });
            // }
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
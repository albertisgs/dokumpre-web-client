// src/pages/AgentDashboard/hooks/useAgentDashboard.jsx (Updated)
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Pusher from 'pusher-js';
import axiosInstance from '../../../axios/axiosInstance';
import { useAuth } from '../../../context/hooks/useAuth';
import toast from 'react-hot-toast';


// --- API Functions ---
const fetchQueue = async () => {
    const { data } = await axiosInstance.generalSession.get('/api/live-chat/agent/queue');
    return data;
};

const claimChatSession = async (sessionId) => {
    const { data } = await axiosInstance.generalSession.post(`/api/live-chat/agent/sessions/${sessionId}/claim`);
    return data;
};

const postAgentMessage = async ({ sessionId, text }) => {
    const { data } = await axiosInstance.generalSession.post(`/api/live-chat/agent/sessions/${sessionId}/send-message`, { message_text: text });
    return data;
};

const endChatSession = async (sessionId) => {
    const { data } = await axiosInstance.generalSession.post(`/api/live-chat/agent/sessions/${sessionId}/resolve`);
    return data;
};

const updateAgentStatus = async (status) => {
    const { data } = await axiosInstance.generalSession.put('/api/live-chat/agent/status', { status });
    return data;
};

const fetchMyActiveSession = async () => {
    const { data } = await axiosInstance.generalSession.get('/api/live-chat/agent/my-session');
    return data;
};

const useAgentDashboard = () => {
    const queryClient = useQueryClient();
    const { authState } = useAuth();
    
    // State untuk sesi yang sedang aktif (hanya satu)
    const [activeChat, setActiveChat] = useState(null); 
    // State untuk pesan dari sesi yang aktif
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    // **[LOGIKA STATUS]** State untuk status agen, default 'offline'
    const [agentStatus, setAgentStatus] = useState('offline');
    // **[LOGIKA STATUS]** Ref untuk mencegah panggilan ganda saat tab berubah
    const statusRef = useRef(agentStatus);

    // **[LOGIKA PERSISTENSI]** Query untuk mengambil sesi aktif saat reload halaman
    const { isLoading: isRestoringSession } = useQuery({
        queryKey: ['myActiveSession'],
        queryFn: fetchMyActiveSession,
        enabled: !!authState.user,
        retry: false,
        onSuccess: (data) => {
            if (data) {
                const userName = data.user_name || 'Customer';
                // Langsung set sesi yang aktif dari server
                setActiveChat({ session_id: data.id, user_name: userName });

                // Gabungkan riwayat dan pesan yang sudah ada
                const historyMessages = data.history || [];
                const liveMessages = data.messages || [];
                const allMessages = [...historyMessages, ...liveMessages];
                allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                
                setMessages(allMessages);
                toast.success(`Sesi dengan ${userName} dipulihkan.`);
            }
        }
    });

    // Query untuk mengambil data antrian (status 'queued')
    const { data: queue = [], isLoading: isQueueLoading } = useQuery({
        queryKey: ['chatQueue'],
        queryFn: fetchQueue,
    });

    // Mutasi untuk mengklaim chat
    const { mutate: claimChat, isPending: isClaiming } = useMutation({
        mutationFn: claimChatSession,
        onSuccess: (data) => {
            const userName = data.user_name || 'Customer';
            // **[FOKUS UTAMA]** Saat berhasil klaim, set sesi ini sebagai sesi aktif
            setActiveChat({ session_id: data.id, user_name: userName });
            
            // Gabungkan riwayat dari Dify dengan pesan live chat (jika ada)
            const historyMessages = data.history.map((h, index) => ({ ...h, id: `history-${index}-${new Date(h.timestamp).getTime()}`}));
            const allMessages = [...historyMessages, ...data.messages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            setMessages(allMessages);
            
            // Invalidate query antrian agar item yang diklaim hilang dari daftar antrian
            queryClient.invalidateQueries({ queryKey: ['chatQueue'] });
            toast.success(`Anda terhubung dengan ${userName}`);
        },
        onError: (error) => toast.error(error.response?.data?.detail || "Gagal mengklaim chat.")
    });

    // Mutasi untuk mengirim pesan
    const { mutate: sendMessage, isPending: isSendingMessage } = useMutation({
        mutationFn: postAgentMessage,
        onSuccess: () => setMessageInput(''),
        onError: (error) => toast.error(error.response?.data?.detail || "Gagal mengirim pesan.")
    });

    // Mutasi untuk menyelesaikan sesi
    const { mutate: endSession, isPending: isEndingSession } = useMutation({
        mutationFn: endChatSession,
        onSuccess: (data) => {
            toast.success(data.message || 'Sesi chat telah ditutup.');
            // **[FOKUS UTAMA]** Kosongkan sesi aktif setelah selesai
            setActiveChat(null);
            setMessages([]);
            queryClient.invalidateQueries({ queryKey: ['myActiveSession'] }); // Invalidate sesi aktif juga
        },
        onError: (error) => toast.error(error.response?.data?.detail || "Gagal menutup sesi.")
    });

    // **[LOGIKA STATUS]** Mutasi untuk mengubah status
    const { mutate: changeStatus } = useMutation({
        mutationFn: updateAgentStatus,
        onSuccess: (data) => {
            const newStatus = data.new_status;
            setAgentStatus(newStatus);
            statusRef.current = newStatus; // Update ref juga
            // Hanya tampilkan notifikasi jika perubahan status bukan 'offline'
            if (newStatus !== 'offline') {
                toast.success(`Status Anda sekarang: ${newStatus}`, { duration: 2000 });
            }
        },
        onError: (error) => toast.error(error.response?.data?.detail || "Gagal mengubah status."),
    });

    // **[LOGIKA STATUS]** Hook untuk menangani visibilitas tab
    useEffect(() => {
        const handleVisibilityChange = () => {
            // Jika tab disembunyikan dan status saat ini 'online', ubah jadi 'away'
            if (document.hidden && statusRef.current === 'online') {
                changeStatus('away');
            } 
            // Jika tab ditampilkan kembali dan status saat ini 'away', ubah jadi 'online'
            else if (!document.hidden && statusRef.current === 'away') {
                changeStatus('online');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [changeStatus]); // Dependency hanya 'changeStatus'

    // **[LOGIKA STATUS]** Hook untuk menangani saat agen membuka dan menutup dashboard
    useEffect(() => {
        // Saat komponen dimuat, set status menjadi 'online'
        changeStatus('online');

        // Fungsi yang akan dijalankan saat agen menutup tab/browser
        const handleBeforeUnload = () => {
            // Menggunakan navigator.sendBeacon untuk pengiriman data yang andal saat halaman ditutup
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify({ status: 'offline' })], { type: 'application/json' });
                // URL harus lengkap jika API Anda di domain berbeda
                const url = `${import.meta.env.VITE_API_URL_GENERAL}/api/live-chat/agent/status`;
                navigator.sendBeacon(url, blob);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Saat komponen dibongkar (unmount), panggil fungsi cleanup
        return () => {
            // Hapus listener untuk mencegah memory leak
            window.removeEventListener('beforeunload', handleBeforeUnload);
            // Set status ke offline secara eksplisit jika pengguna logout secara normal
            changeStatus('offline');
        };
    }, [changeStatus]); // Jalankan hanya sekali saat komponen dimuat

    useEffect(() => {
        // Logika Pusher tidak perlu diubah, sudah bagus
        const pusherKey = import.meta.env.VITE_PUSHER_KEY;
        const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER;
        if (!pusherKey || !pusherCluster) return;

        const pusher = new Pusher(pusherKey, { cluster: pusherCluster });
        const queueChannel = pusher.subscribe('agent-dashboard');
        
        const handleQueueUpdate = () => {
             queryClient.invalidateQueries({ queryKey: ['chatQueue'] });
        };
        
        queueChannel.bind('new-pending-session', handleQueueUpdate);
        queueChannel.bind('session-claimed', handleQueueUpdate);
       
        let sessionChannel;
        if (activeChat) {
            const channelName = `chat-session-${activeChat.session_id}`;
            sessionChannel = pusher.subscribe(channelName);
            sessionChannel.bind('new_message', (newMessage) => {
                 setMessages(prev => [...prev, newMessage]);
            });
        }

        return () => {
            pusher.unsubscribe('agent-dashboard');
            if (sessionChannel) pusher.unsubscribe(sessionChannel.name);
        };
    }, [queryClient, activeChat]);

    return {
        queue, isQueueLoading,
        activeChat, setActiveChat,
        messages, setMessages,
        claimChat, isClaiming,
        messageInput, setMessageInput,
        sendMessage, isSendingMessage,
        endSession, isEndingSession,
        agent: authState.user,
        isRestoringSession,
        // **[LOGIKA STATUS]** Ekspor status dan fungsi pengubahnya
        agentStatus,
        changeStatus,
    };
};

export default useAgentDashboard;
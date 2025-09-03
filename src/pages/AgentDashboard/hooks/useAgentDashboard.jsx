// src/pages/AgentDashboard/hooks/useAgentDashboard.jsx (Lengkap dan Final)
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Pusher from 'pusher-js';
import axiosInstance from '../../../axios/axiosInstance';
import { useAuth } from '../../../context/hooks/useAuth';
import toast from 'react-hot-toast';

// --- Kumpulan Fungsi API ---
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

const transferChat = async ({ sessionId, toAgentId }) => {
    const { data } = await axiosInstance.generalSession.post(`/api/live-chat/agent/sessions/${sessionId}/transfer`, { to_agent_id: toAgentId });
    return data;
};

const fetchMyActiveSession = async () => {
    const { data } = await axiosInstance.generalSession.get('/api/live-chat/agent/my-session');
    return data;
};

const useAgentDashboard = () => {
    const queryClient = useQueryClient();
    const { authState } = useAuth();
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [agentStatus, setAgentStatus] = useState('offline');

    // Query untuk mengambil sesi aktif saat komponen dimuat
    const { isLoading: isRestoringSession } = useQuery({
        queryKey: ['myActiveSession'],
        queryFn: fetchMyActiveSession,
        enabled: !!authState.user,
        retry: false,
        onSuccess: (data) => {
            if (data) {
                const userName = data.user_name || 'Customer';
                setActiveChat({ session_id: data.id, user_name: userName });

                // --- PERBAIKAN UTAMA DI SINI ---
                // 1. Ambil kedua array dari data
                const historyMessages = data.history || [];
                const liveMessages = data.messages || [];

                // 2. Gabungkan kedua array menjadi satu
                const allMessages = [...historyMessages, ...liveMessages];
                
                // 3. Urutkan berdasarkan timestamp untuk memastikan urutan kronologis
                allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                
                // 4. Set state dengan data yang sudah digabung dan diurutkan
                setMessages(allMessages);

                toast.success(`Sesi dengan ${userName} dipulihkan.`);
            }
        }
    });

    const { data: queue = [], isLoading: isQueueLoading } = useQuery({
        queryKey: ['chatQueue'],
        queryFn: fetchQueue,
    });

      const { mutate: claimChat, isPending: isClaiming } = useMutation({
        mutationFn: claimChatSession,
        onSuccess: (data) => {
            // --- PERBAIKAN UTAMA DI SINI ---
            // 1. Ambil nama user langsung dari respons API, bukan dari state 'queue'
            const userName = data.user_name || 'Customer';

            // 2. Atur activeChat dengan data yang pasti benar
            setActiveChat({ session_id: data.id, user_name: userName });
            
            // 3. Gabungkan dan urutkan riwayat & pesan
            const historyMessages = data.history.map((h, index) => ({ ...h, id: `history-${index}-${new Date(h.timestamp).getTime()}`}));
            const allMessages = [...historyMessages, ...data.messages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            setMessages(allMessages);
            
            // 4. Invalidate query antrian SETELAH semua state diatur
            queryClient.invalidateQueries({ queryKey: ['chatQueue'] });

            toast.success(`Anda terhubung dengan ${userName}`);
        },
        onError: (error) => toast.error(error.response?.data?.detail || "Gagal mengklaim chat.")
    });


    const { mutate: sendMessage, isPending: isSendingMessage } = useMutation({
        mutationFn: postAgentMessage,
        onSuccess: () => setMessageInput(''),
        onError: (error) => toast.error(error.response?.data?.detail || "Gagal mengirim pesan.")
    });

    const { mutate: endSession, isPending: isEndingSession } = useMutation({
        mutationFn: endChatSession,
        onSuccess: (data) => {
            toast.success(data.message || 'Sesi chat telah ditutup.');
            setActiveChat(null);
            setMessages([]);
            queryClient.invalidateQueries({ queryKey: ['chatQueue'] });
        },
        onError: (error) => toast.error(error.response?.data?.detail || "Gagal menutup sesi.")
    });
    
    const { mutate: changeStatus } = useMutation({
        mutationFn: updateAgentStatus,
        onSuccess: (data) => {
            setAgentStatus(data.new_status);
            toast.success(`Status Anda sekarang: ${data.new_status}`);
        },
        onError: (error) => toast.error(error.response?.data?.detail || "Gagal mengubah status."),
    });

    const { mutate: transferSession, isPending: isTransferring } = useMutation({
        mutationFn: transferChat,
        onSuccess: (data) => {
            toast.success(data.message);
            setActiveChat(null);
            setMessages([]);
        },
        onError: (error) => toast.error(error.response?.data?.detail || "Gagal mentransfer sesi.")
    });

    const handleSetOnline = useCallback(() => changeStatus('online'), [changeStatus]);
    const handleSetOffline = useCallback(() => changeStatus('offline'), [changeStatus]);

    useEffect(() => {
        handleSetOnline();
        const handleBeforeUnload = () => {
             if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify({ status: 'offline' })], { type: 'application/json' });
                navigator.sendBeacon('/api/live-chat/agent/status', blob);
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            handleSetOffline();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [handleSetOnline, handleSetOffline]);


    useEffect(() => {
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
        
        const agentChannelName = `agent-${authState.user?.id}`;
        const agentChannel = pusher.subscribe(agentChannelName);
        
        agentChannel.bind('session-transferred-to-you', (data) => {
            toast.success("Anda menerima sesi transfer. Klaim dari antrian.");
            queryClient.invalidateQueries({ queryKey: ['chatQueue'] });
        });

        agentChannel.bind('session-transferred-away', () => {
            toast.info("Sesi Anda telah berhasil ditransfer.");
            setActiveChat(null);
            setMessages([]);
        });

        return () => {
            pusher.unsubscribe('agent-dashboard');
            pusher.unsubscribe(agentChannelName);
            if (sessionChannel) pusher.unsubscribe(sessionChannel.name);
        };
    }, [queryClient, activeChat, authState.user?.id]);

    return {
        queue, isQueueLoading,
        activeChat, messages,
        claimChat, isClaiming,
        messageInput, setMessageInput,
        sendMessage, isSendingMessage,
        endSession, isEndingSession,
        agent: authState.user,
        agentStatus, changeStatus,
        transferSession, isTransferring,
        isRestoringSession,
    };
};

export default useAgentDashboard;
// src/pages/AgentDashboard/hooks/useAgentDashboard.jsx (Diperbaiki)
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Pusher from 'pusher-js';
import axiosInstance from '../../../axios/axiosInstance';
import { useAuth } from '../../../context/hooks/useAuth';
import toast from 'react-hot-toast';

// Fungsi API
const fetchQueue = async () => {
    const { data } = await axiosInstance.generalSession.get('/api/live-chat/queue');
    return data;
};

const claimChatSession = async (sessionId) => {
    const { data } = await axiosInstance.generalSession.post(`/api/live-chat/sessions/${sessionId}/claim`);
    return data;
};

const postAgentMessage = async ({ sessionId, text }) => {
    const { data } = await axiosInstance.generalSession.post(`/api/live-chat/sessions/${sessionId}/send-message`, { message_text: text });
    return data;
};

const endChatSession = async (sessionId) => {
    const { data } = await axiosInstance.generalSession.post(`/api/live-chat/sessions/${sessionId}/resolve`);
    return data;
};


const useAgentDashboard = () => {
    const queryClient = useQueryClient();
    const { authState } = useAuth();
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');

    const { data: queue = [], isLoading: isQueueLoading } = useQuery({
        queryKey: ['chatQueue'],
        queryFn: fetchQueue,
    });

    const { mutate: claimChat, isPending: isClaiming } = useMutation({
        mutationFn: claimChatSession,
        onSuccess: (data) => {
            const claimedQueueItem = queue.find(item => item.session_id === data.id);
            const userName = claimedQueueItem?.user_name || 'Customer';

            setActiveChat({ session_id: data.id, user_name: userName });

            const historyMessages = data.history.map((h, index) => ({
                ...h,
                id: `history-${index}-${new Date(h.timestamp).getTime()}`, 
            }));

            const allMessages = [...historyMessages, ...data.messages];

            allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            setMessages(allMessages);

            toast.success(`Anda terhubung dengan ${userName}`);
        },
        onError: (error) => {
            toast.error(error.response?.data?.detail || "Gagal mengklaim chat.");
        }
    });

    const { mutate: sendMessage, isPending: isSendingMessage } = useMutation({
        mutationFn: postAgentMessage,
        onSuccess: () => {
            setMessageInput('');
        },
        onError: (error) => {
            toast.error(error.response?.data?.detail || "Gagal mengirim pesan.");
        }
    });

    const { mutate: endSession, isPending: isEndingSession } = useMutation({
        mutationFn: endChatSession,
        onSuccess: (data) => {
            toast.success(data.message || 'Sesi chat telah ditutup.');
            setActiveChat(null);
            setMessages([]);
            queryClient.invalidateQueries({ queryKey: ['chatQueue'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.detail || "Gagal menutup sesi.");
        }
    });


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

            const handleNewMessage = (newMessage) => {
                // FIX: Tambahkan pesan baru ke state
                setMessages(prev => [...prev, newMessage]);
            };
            sessionChannel.bind('new_message', handleNewMessage);
        }

        return () => {
            queueChannel.unbind_all();
            if (sessionChannel) {
                pusher.unsubscribe(sessionChannel.name);
            }
        };
    }, [queryClient, activeChat]);

    return {
        queue,
        isQueueLoading,
        activeChat,
        messages,
        claimChat,
        isClaiming,
        messageInput,
        setMessageInput,
        sendMessage,
        isSendingMessage,
        endSession,
        isEndingSession,
        agent: authState.user,
    };
};

export default useAgentDashboard;
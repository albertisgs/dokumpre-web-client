// src/pages/AgentDashboard/hooks/useAgentDashboard.js
import { useState, useEffect, useCallback } from 'react';
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
    const { data } = await axiosInstance.generalSession.post(`/api/live-chat/${sessionId}/claim`);
    return data;
};

const postAgentMessage = async ({ sessionId, text }) => {
    const { data } = await axiosInstance.generalSession.post(`/api/live-chat/${sessionId}/message`, { text });
    return data;
};

const endChatSession = async (sessionId) => {
    const { data } = await axiosInstance.generalSession.post(`/api/live-chat/${sessionId}/end`);
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
            setActiveChat({ session_id: data.session_id, user_name: 'Customer' }); // Placeholder name, will be updated
            
            const historyMessages = data.dify_history.flatMap(h => [
                { id: `dify-q-${h.created_at}`, sender_type: 'user', message_text: h.query, timestamp: h.created_at },
                { id: `dify-a-${h.created_at}`, sender_type: 'system', message_text: `[From Chatbot] ${h.answer}`, timestamp: h.created_at }
            ]);

            setMessages([...historyMessages, ...data.messages]);
            toast.success(`Anda terhubung dengan chat #${data.session_id.substring(0, 8)}`);
            
            // Mengambil nama user dari item antrian yang sesuai untuk UI yang lebih baik
            const claimedQueueItem = queue.find(item => item.session_id === data.session_id);
            if (claimedQueueItem) {
                setActiveChat(prev => ({ ...prev, user_name: claimedQueueItem.user_name }));
            }
        },
        onError: (error) => {
            toast.error(error.response?.data?.detail || "Gagal mengklaim chat.");
        }
    });

    const { mutate: sendMessage, isPending: isSendingMessage } = useMutation({
        mutationFn: postAgentMessage,
        onSuccess: () => {
            setMessageInput(''); // Kosongkan input setelah berhasil
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
            // Meminta data antrian yang baru karena satu sesi telah selesai
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
        
        const handleQueueUpdate = (data) => {
            queryClient.setQueryData(['chatQueue'], data.queue);
        };
        queueChannel.bind('queue-updated', handleQueueUpdate);

        let sessionChannel;
        if (activeChat) {
            sessionChannel = pusher.subscribe(`chat-session-${activeChat.session_id}`);
            
            const handleNewMessage = (newMessage) => {
                setMessages(prev => [...prev, newMessage]);
            };
            sessionChannel.bind('new-message', handleNewMessage);
        }

        return () => {
            queueChannel.unbind('queue-updated', handleQueueUpdate);
            if (sessionChannel) {
                pusher.unsubscribe(`chat-session-${activeChat.session_id}`);
            }
        };
    }, [queryClient, activeChat]);

    return {
        agentStats: { active: 0, queue: queue.length, today: 0 },
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
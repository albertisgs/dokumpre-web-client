// src/layouts/hooks/useAgentData.js
import { useAuth } from '../../context/hooks/useAuth';
import { useAgentStore } from '../store/useAgentStore';

export const useAgentData = () => {
    const { queue, activeChats, history, pending } = useAgentStore(); // Ganti activeChat -> activeChats
    const { authState } = useAuth();

    return {
        queueCount: (queue || []).length,
        pendingCount: (pending || []).length,
        activeCount: (activeChats || []).length, // Gunakan .length dari array
        historyCount: (history || []).length,
        agentName: authState.user?.name,
    };
};
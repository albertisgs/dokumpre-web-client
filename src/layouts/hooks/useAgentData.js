
import { useAuth } from '../../context/hooks/useAuth';
import { useAgentStore } from '../store/useAgentStore';

export const useAgentData = () => {
    // Langsung ambil state dari store
    const { queue, activeChat, history, pending } = useAgentStore();
    console.log("line 8", queue)
    console.log("line 9", pending)
    const { authState } = useAuth();

    return {
        // Hitung berdasarkan panjang array dari store
        queueCount: (queue || []).length,
        pendingCount: (pending || []).length,
        activeCount: activeChat ? 1 : 0,
        historyCount: (history || []).length,

        agentName: authState.user?.name,
    };
};
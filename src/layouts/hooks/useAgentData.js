
import { useAuth } from '../../context/hooks/useAuth';
import { useAgentStore } from '../store/useAgentStore';

export const useAgentData = () => {
    // Langsung ambil state dari store
    const { queue, activeChat, history } = useAgentStore();
    const { authState } = useAuth();

    return {
        // Hitung berdasarkan panjang array dari store
        queueCount: queue.length,
        activeCount: activeChat ? 1 : 0,
        historyCount: history.length,
        agentName: authState.user?.name,
    };
};
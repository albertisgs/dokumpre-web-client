// src/layouts/AgentSidebarSection.jsx (File Baru)
import { useAgentData } from "../hooks/useAgentData";

// Impor hook yang baru kita buat

const AgentSidebarSection = () => {
    const { queueCount, activeCount, historyCount, agentName, agentStatus, changeStatus } = useAgentData();

    // Inisial nama agen
    const agentInitial = agentName ? agentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'A';

    // Konfigurasi untuk warna dan teks status
    const statusConfig = {
        online: { text: 'Online', color: 'bg-green-500' },
        away: { text: 'Away', color: 'bg-yellow-500' },
        offline: { text: 'Offline', color: 'bg-red-500' },
    };

    return (
        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 hidden md:block">
            <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm mr-2">
                    {agentInitial}
                </div>
                <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-700">{agentName}</div>
                    {/* Tampilkan status dinamis dari store */}
                    <div className={`text-xs font-semibold ${
                        agentStatus === 'online' ? 'text-green-600' :
                        agentStatus === 'away' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                        {statusConfig[agentStatus]?.text || 'Unknown'}
                    </div>
                </div>
                {/* Indikator dot dinamis */}
                <div className={`w-2 h-2 rounded-full ${statusConfig[agentStatus]?.color || 'bg-gray-400'}`}></div>
            </div>
            <div className="flex justify-between text-center">
                <div>
                    <span className="block font-bold text-lg text-gray-800">
                        {activeCount}
                    </span>
                    <span className="text-xs text-gray-500">Aktif</span>
                </div>
                <div>
                    <span className="block font-bold text-lg text-gray-800">
                        {queueCount}
                    </span>
                    <span className="text-xs text-gray-500">Antrian</span>
                </div>
                <div>
                    <span className="block font-bold text-lg text-gray-800">
                        {historyCount} 
                    </span>
                    <span className="text-xs text-gray-500">Riwayat</span>
                </div>
            </div>
        </div>
    );
};

export default AgentSidebarSection;
// src/pages/AgentDashboard/AgentStatusControl.jsx (File Baru)
import React, { useState } from 'react';
import { Settings } from 'lucide-react';

const AgentStatusControl = ({ status, onStatusChange, agentName }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Konfigurasi untuk setiap status
    const statusConfig = {
        online: { text: 'Online', color: 'bg-green-500' },
        away: { text: 'Away', color: 'bg-yellow-500' },
        offline: { text: 'Offline', color: 'bg-red-500' },
    };

    const handleSelect = (newStatus) => {
        onStatusChange(newStatus); // Panggil fungsi mutasi dari hook
        setIsOpen(false);
    };

    return (
        <div className="p-4 border-t border-gray-200 relative">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${statusConfig[status]?.color || 'bg-gray-400'}`}></div>
                    <span className="font-semibold text-sm">{agentName}</span>
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-md hover:bg-gray-200">
                    <Settings className="w-5 h-5 text-gray-600"/>
                </button>
            </div>
            {isOpen && (
                <div className="absolute bottom-full left-0 w-full bg-white border rounded-md shadow-lg mb-2 z-20">
                    {Object.keys(statusConfig).map(key => (
                        <button 
                            key={key} 
                            onClick={() => handleSelect(key)} 
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                        >
                            <div className={`w-2.5 h-2.5 rounded-full mr-3 ${statusConfig[key].color}`}></div>
                            {statusConfig[key].text}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AgentStatusControl;
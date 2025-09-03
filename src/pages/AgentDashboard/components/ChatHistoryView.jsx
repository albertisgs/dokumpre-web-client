// src/pages/AgentDashboard/components/ChatHistoryView.jsx (File Baru)
import React, { useState } from 'react';
import { useGetHistoryList, useGetTranscript } from '../hooks/useChatHistory';
import { Loader2, Inbox, MessageSquareText } from 'lucide-react';

// Komponen untuk menampilkan transkrip
const TranscriptViewer = ({ sessionId }) => {
    const { data: session, isLoading, isError } = useGetTranscript(sessionId);

    if (isLoading) return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    if (isError) return <div className="p-4 text-red-500">Gagal memuat transkrip.</div>;
    if (!session) return null;

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b">
                <h3 className="font-bold">Transkrip dengan: {session.user_name || 'User'}</h3>
                <p className="text-xs text-gray-500">Selesai pada: {new Date(session.ended_at).toLocaleString('id-ID')}</p>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <pre className="text-sm whitespace-pre-wrap font-sans">{session.transcript}</pre>
            </div>
        </div>
    );
};

// Komponen utama untuk tampilan riwayat
const ChatHistoryView = () => {
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const { data: historyList, isLoading, isError } = useGetHistoryList();

    return (
        <div className="flex h-full bg-white m-4 rounded-lg shadow-sm border">
            {/* Panel Kiri: Daftar Riwayat */}
            <div className="w-1/3 border-r flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="font-bold text-lg">Riwayat Chat</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><Loader2 className="w-6 h-6 animate-spin" /></div>}
                    {isError && <div className="p-4 text-red-500">Gagal memuat riwayat.</div>}
                    {historyList && historyList.length > 0 ? (
                        historyList.map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => setSelectedSessionId(item.id)}
                                className={`p-4 border-b cursor-pointer ${selectedSessionId === item.id ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
                            >
                                <p className="font-semibold text-sm">{item.user_name}</p>
                                <p className="text-xs text-gray-500">{new Date(item.ended_at).toLocaleString('id-ID')}</p>
                            </div>
                        ))
                    ) : (
                        !isLoading && <div className="p-4 text-center text-gray-500">Tidak ada riwayat.</div>
                    )}
                </div>
            </div>
            {/* Panel Kanan: Tampilan Transkrip */}
            <div className="w-2/3">
                {selectedSessionId ? (
                    <TranscriptViewer sessionId={selectedSessionId} />
                ) : (
                    <div className="flex flex-col justify-center items-center h-full text-gray-400">
                        <Inbox className="w-16 h-16 mb-4" />
                        <p>Pilih item untuk melihat transkrip.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatHistoryView;
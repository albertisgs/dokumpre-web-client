// src/pages/AgentDashboard/AgentDashboard.jsx (Final & Updated)
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';


import { Loader2, Send, PhoneOff } from 'lucide-react';
import { useAuth } from '../../context/hooks/useAuth';
import { useAgentStore } from '../../layouts/store/useAgentStore';
import ChatHistoryView from './components/ChatHistoryView';


// --- Sub-Komponen: Pesan Individual ---
const ChatMessage = ({ msg, agent, user }) => {
    const isAgent = msg.sender_type === 'agent';
    const isSystem = msg.sender_type === 'system' || msg.sender_type === 'bot';
    
    if (isSystem) {
        return (
            <div className="my-4 text-center">
                <span className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">{msg.message_text || msg.text}</span>
            </div>
        );
    }

    return (
        <div className={`flex items-end gap-3 my-4 ${isAgent ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${isAgent ? 'bg-green-500' : 'bg-blue-500'}`}>
                {isAgent ? agent.name?.charAt(0).toUpperCase() : user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className={`p-3 rounded-lg max-w-[70%] ${isAgent ? 'bg-green-100 text-gray-800' : 'bg-white border'}`}>
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.message_text || msg.text}</p>
                <div className={`text-xs mt-1 text-right ${isAgent ? 'text-gray-500' : 'text-gray-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
};


// --- Sub-Komponen: Jendela Chat Aktif ---
const LiveChatWindow = ({ sessionId }) => {
    const { authState } = useAuth();
    const { activeChat, endSession } = useAgentStore();
    const [messages, setMessages] = useState([]); // State lokal untuk pesan
    const [messageInput, setMessageInput] = useState('');
    // Anda bisa menambahkan state loading/sending di sini jika diperlukan
    const messagesEndRef = useRef(null);

    // TODO: Hubungkan ini dengan state global atau Pusher untuk real-time update
    // Untuk sekarang, kita asumsikan `activeChat` dari store sudah berisi messages.
    useEffect(() => {
        if (activeChat && activeChat.id === sessionId) {
            const allMessages = [...(activeChat.history || []), ...(activeChat.messages || [])];
            allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            setMessages(allMessages);
        }
    }, [activeChat, sessionId]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;
        // TODO: Panggil action `sendMessage` dari store
        console.log("Mengirim:", messageInput);
        setMessageInput('');
    };
    
    const handleResolveChat = () => {
        if (window.confirm("Apakah Anda yakin ingin menyelesaikan sesi ini?")) {
            endSession(sessionId);
        }
    };

    if (!activeChat || activeChat.id !== sessionId) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="ml-4 text-gray-600">Memuat sesi...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 m-4 rounded-lg shadow-sm border">
            <div className="p-4 border-b flex justify-between items-center bg-white rounded-t-lg">
                <h3 className="font-bold">{activeChat.user_name}</h3>
                <button 
                    onClick={handleResolveChat} 
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-green-700 disabled:bg-gray-400"
                >
                    Selesaikan Sesi
                </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <ChatMessage key={msg.id || `msg-${index}`} msg={msg} agent={authState.user} user={{ name: activeChat.user_name }} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-3 bg-white rounded-b-lg">
                <textarea
                    className="w-full p-2 border rounded-md resize-none"
                    placeholder="Ketik balasan Anda..."
                    rows="2"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }}}
                />
                <button type="submit" disabled={!messageInput.trim()} className="bg-blue-600 text-white p-2 rounded-full h-10 w-10 flex-shrink-0 flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-400">
                    <Send className="w-5 h-5"/>
                </button>
            </form>
        </div>
    );
}

// --- Komponen Halaman Utama ---
const AgentDashboard = ({ view }) => {
    const { sessionId } = useParams();

    // Tampilan Riwayat
    if (view === 'history') {
        return <ChatHistoryView />;
    }
    
    // Tampilan Chat Aktif berdasarkan URL
    if (view === 'live' && sessionId) {
        return <LiveChatWindow sessionId={sessionId} />;
    }

    // Tampilan Default (halaman /agent-dashboard tanpa sessionId)
    return (
        <div className="flex flex-col justify-center items-center h-full text-gray-500 p-8 text-center">
            <PhoneOff className="w-16 h-16 text-gray-300 mb-4"/>
            <h3 className="text-xl font-semibold text-gray-700">Selamat Datang di Dashboard Agen</h3>
            <p className="text-gray-600 mt-2">
                Pilih percakapan dari antrian atau sesi aktif di sidebar untuk memulai.
            </p>
        </div>
    );
};

export default AgentDashboard;
// src/pages/AgentDashboard/AgentDashboard.jsx
import React, { useRef, useEffect } from 'react';
import useAgentDashboard from './hooks/useAgentDashboard';
import { Loader2, Send } from 'lucide-react';
import { useAuth } from '../../context/hooks/useAuth';


// Komponen untuk setiap item dalam antrian
const QueueItem = ({ chat, activeChat, onSelectChat }) => (
    <div 
        className={`p-4 border-b border-gray-200 cursor-pointer transition-all duration-200 relative ${activeChat?.session_id === chat.session_id ? 'bg-blue-100 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
        onClick={() => onSelectChat(chat.session_id)}

    >
        <div className="flex justify-between items-center mb-2">
            <div className="font-bold text-sm text-gray-800">{chat.user_name}</div>
            <div className="text-xs text-gray-500">
                {new Date(chat.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
        <p className="text-xs text-gray-600 truncate">Menunggu untuk terhubung...</p>
    </div>
);

// Komponen untuk pesan dalam chat
const ChatMessage = ({ msg, agent, user }) => {
    const isAgent = msg.sender_type === 'agent';
    const isSystem = msg.sender_type === 'system';
    
    if (isSystem) {
        return (
            <div className="my-4 text-center">
                <span className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">{msg.message_text}</span>
            </div>
        );
    }

    return (
        <div className={`flex items-end gap-3 my-4 ${isAgent ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${isAgent ? 'bg-green-500' : 'bg-blue-500'}`}>
                {isAgent ? agent.name?.charAt(0).toUpperCase() : user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className={`p-3 rounded-lg max-w-[70%] ${isAgent ? 'bg-green-500 text-white' : 'bg-white border'}`}>
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.message_text}</p>
                <div className={`text-xs mt-1 ${isAgent ? 'text-green-200' : 'text-gray-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
};

// Komponen utama Dasbor Agen
const AgentDashboard = () => {
    const { authState } = useAuth();
    const {
        queue,
        isQueueLoading,
        activeChat,
        messages,
        isClaiming,
        claimChat,
        messageInput,
        setMessageInput,
        sendMessage,
        isSendingMessage,
        endSession,
        isEndingSession,
        agent,
    } = useAgentDashboard();

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (messageInput.trim() && activeChat && !isSendingMessage) {
            sendMessage({ sessionId: activeChat.session_id, text: messageInput });
        }
    };

    const handleResolveChat = () => {
        if (activeChat && window.confirm("Apakah Anda yakin ingin menyelesaikan sesi ini?")) {
            endSession(activeChat.session_id);
        }
    };

    return (
        <div className="flex h-[calc(100vh-100px)] bg-gray-100 font-sans">
            {/* Kolom Kiri: Antrian Chat */}
            <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="font-bold text-lg">Antrian Chat ({queue.length})</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {isQueueLoading ? (
                         <div className="flex justify-center items-center h-full"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                    ) : queue.length > 0 ? (
                        queue.map(chat => (
                            <QueueItem key={chat.session_id} chat={chat} activeChat={activeChat} onSelectChat={claimChat} />
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">Tidak ada antrian.</div>
                    )}
                </div>
            </div>

            {/* Kolom Kanan: Jendela Chat Aktif */}
            <div className="flex-1 flex flex-col">
                {activeChat ? (
                    <div className="flex flex-col h-full bg-white m-4 rounded-lg shadow-sm border">
                        <div className="p-4 border-b flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">{activeChat.user_name}</h3>
                                <p className="text-xs text-gray-500 truncate max-w-xs">ID Sesi: {activeChat.session_id}</p>
                            </div>
                            <button onClick={handleResolveChat} disabled={isEndingSession} className="bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-green-700 disabled:bg-gray-400">
                                {isEndingSession ? 'Menutup...' : 'Resolve'}
                            </button>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                            {isClaiming ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg) => (
                                        <ChatMessage key={msg.id} msg={msg} agent={agent} user={{name: activeChat.user_name}} />
                                    ))}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-3">
                            <textarea 
                                className="w-full p-2 border rounded-md resize-none" 
                                placeholder="Ketik balasan Anda..." 
                                rows="2"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                disabled={isClaiming || isEndingSession}
                            />
                            <button type="submit" disabled={!messageInput.trim() || isSendingMessage || isClaiming} className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                                {isSendingMessage ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-full text-gray-500">
                        Pilih chat dari antrian untuk memulai.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentDashboard;


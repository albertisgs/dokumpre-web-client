// src/pages/AgentDashboard/AgentDashboard.jsx (Diperbarui)
import React, { useRef, useEffect, useState } from 'react';
import useAgentDashboard from './hooks/useAgentDashboard';
import { Loader2, Send, PhoneOff, Users, UserCheck, Settings, MoveRight } from 'lucide-react';

// --- Komponen-komponen UI (dipisah agar lebih rapi) ---

const QueueItem = ({ chat, onSelectChat, isClaiming }) => (
    <div 
        className="p-4 border-b border-gray-200 cursor-pointer transition-colors duration-200 hover:bg-gray-50"
        onClick={() => !isClaiming && onSelectChat(chat.session_id)}
    >
        <div className="flex justify-between items-center mb-1">
            <div className="font-bold text-sm text-gray-800 flex items-center">
                <UserCheck className="w-4 h-4 mr-2 text-gray-400"/>
                {chat.user_name}
            </div>
            <div className="text-xs text-gray-500">
                {new Date(chat.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
        <p className="text-xs text-gray-600 truncate">Menunggu untuk terhubung...</p>
    </div>
);

const ChatMessage = ({ msg, agent, user }) => {
    const isAgent = msg.sender_type === 'agent';
    const isSystem = msg.sender_type === 'system' || msg.sender_type === 'bot';
    
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
                <div className={`text-xs mt-1 text-right ${isAgent ? 'text-green-200' : 'text-gray-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
};

// (BARU) Komponen untuk Status Dropdown & Kontrol
const AgentStatusControl = ({ status, onStatusChange, agentName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const statusConfig = {
        online: { text: 'Online', color: 'bg-green-500' },
        away: { text: 'Away', color: 'bg-yellow-500' },
        offline: { text: 'Offline', color: 'bg-red-500' },
    };

    const handleSelect = (newStatus) => {
        onStatusChange(newStatus);
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
                <div className="absolute bottom-full left-0 w-full bg-white border rounded-md shadow-lg mb-2">
                    {Object.keys(statusConfig).map(key => (
                        <button key={key} onClick={() => handleSelect(key)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center">
                            <div className={`w-2.5 h-2.5 rounded-full mr-3 ${statusConfig[key].color}`}></div>
                            {statusConfig[key].text}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


// --- Komponen Utama Dasbor Agen ---
const AgentDashboard = () => {
    const {
        queue, isQueueLoading,
        activeChat, messages,
        isClaiming, claimChat,
        messageInput, setMessageInput,
        sendMessage, isSendingMessage,
        endSession, isEndingSession,
        agent,
        agentStatus, changeStatus,
        transferSession, isTransferring, // Ambil fungsi dan state transfer
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
    
    // (BARU) Fungsi untuk handle transfer
    const handleTransfer = () => {
        const targetAgentId = prompt("Masukkan ID Agen tujuan untuk transfer:");
        if (targetAgentId && activeChat) {
            transferSession({ sessionId: activeChat.session_id, toAgentId: targetAgentId });
        }
    };

    return (
        <div className="flex h-[calc(100vh-100px)] bg-gray-100 font-sans">
            <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b flex items-center">
                    <Users className="w-5 h-5 mr-3 text-gray-500"/>
                    <h2 className="font-bold text-lg">Antrian Chat ({queue.length})</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {isQueueLoading ? (
                         <div className="flex justify-center items-center h-full"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                    ) : queue.length > 0 ? (
                        queue.map(chat => (
                            <QueueItem key={chat.session_id} chat={chat} onSelectChat={claimChat} isClaiming={isClaiming}/>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500 text-sm mt-4">Tidak ada antrian.</div>
                    )}
                </div>
                <AgentStatusControl status={agentStatus} onStatusChange={changeStatus} agentName={agent?.name || 'Agent'}/>
            </div>

            <div className="flex-1 flex flex-col">
                {activeChat ? (
                    <div className="flex flex-col h-full bg-white m-4 rounded-lg shadow-sm border">
                        <div className="p-4 border-b flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">{activeChat.user_name}</h3>
                                <p className="text-xs text-gray-500 truncate max-w-xs">ID Sesi: {activeChat.session_id}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handleTransfer} disabled={isTransferring} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-yellow-600 disabled:bg-gray-400 flex items-center">
                                    <MoveRight className="w-4 h-4 mr-1"/>
                                    {isTransferring ? 'Mentransfer...' : 'Transfer'}
                                </button>
                                <button onClick={handleResolveChat} disabled={isEndingSession} className="bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-green-700 disabled:bg-gray-400">
                                    {isEndingSession ? 'Menutup...' : 'Resolve'}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                            {isClaiming ? (
                                <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                            ) : (
                                <>
                                    {messages.map((msg) => ( <ChatMessage key={msg.id} msg={msg} agent={agent} user={{name: activeChat.user_name}} /> ))}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-3">
                            <textarea className="w-full p-2 border rounded-md resize-none" placeholder="Ketik balasan Anda..." rows="2"
                                value={messageInput} onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }}}
                                disabled={isClaiming || isEndingSession}
                            />
                            <button type="submit" disabled={!messageInput.trim() || isSendingMessage || isClaiming} className="bg-blue-600 text-white p-2 rounded-full h-10 w-10 flex-shrink-0 flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-400">
                                {isSendingMessage ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="flex flex-col justify-center items-center h-full text-gray-500">
                        <PhoneOff className="w-16 h-16 text-gray-300 mb-4"/>
                        <h3 className="text-lg font-semibold">Tidak ada sesi aktif</h3>
                        <p className="text-sm">Pilih chat dari antrian untuk memulai.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentDashboard;
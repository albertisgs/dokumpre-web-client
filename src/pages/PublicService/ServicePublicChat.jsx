// src/pages/PublicService/ServicePublicChat.jsx
import React, { useRef, useEffect } from 'react';
import { Loader2, Send, UserCheck } from 'lucide-react';

import { useAuth } from '../../context/hooks/useAuth';
import CitationModal from './components/CitationModal';
import { useServicePublicChat } from './hooks/useServicePublic';

const ServicePublicChat = () => {
  const {
    messages, input, setInput, chatMode, isBotLoading,
    showAgentTrigger, isRequestingAgent, requestAgent,
    handleSendMessage, isSendingToAgent,
    citations, openCitations, selectedCitation,
    toggleCitations, handleOpenModal, handleCloseModal,
    difyConversationId // <-- Ambil difyConversationId di sini
  } = useServicePublicChat();

  const { authState } = useAuth();
  const userData = authState?.user || '';
  const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotLoading]);
  
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  // --- PERBAIKAN DI SINI ---
  // Gunakan variabel difyConversationId yang sudah ada dari hook.
  const handleRequestAgent = () => {
    if (difyConversationId) {
        requestAgent(difyConversationId);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-[1200px] mx-auto w-full h-full">
      <div className="flex-1 p-6 overflow-y-auto bg-white m-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
        {messages.map((msg) => {
          const messageCitations = citations.filter(c => c.messageId === msg.id);
          const hasCitations = messageCitations.length > 0;
          const isCitationOpen = openCitations[msg.id];

          return(
          <div key={msg.id} className={`mb-6 flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : msg.sender === 'system' ? 'justify-center' : ''}`}>
            {msg.sender !== 'system' && (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 text-white ${msg.sender === 'user' ? 'bg-[#4c6ef5]' : 'bg-[#28a745]'}`}>
                    {msg.sender === 'user' ? userInitial : 'A'}
                </div>
            )}
            <div className={`p-4 rounded-xl max-w-[70%] leading-relaxed ${
                msg.sender === 'user' ? 'bg-[#4c6ef5] text-white' 
                : msg.sender === 'system' ? 'bg-gray-200 text-gray-600 text-xs'
                : 'bg-[#f8f9fa] text-gray-800'
            }`}>
              <p className="whitespace-pre-wrap m-0">{msg.text}</p>
              
              {hasCitations && (
                  <div className={`mt-4 pt-3 border-t ${msg.sender === 'user' ? 'border-blue-300' : 'border-gray-200'}`}>
                    <button 
                      onClick={() => toggleCitations(msg.id)}
                      className="w-full flex justify-between items-center text-left text-xs font-semibold text-gray-500 mb-2 focus:outline-none"
                    >
                      <span>SUMBER ({messageCitations.length})</span>
                      <span className={`transform transition-transform duration-300 ${isCitationOpen ? 'rotate-180' : 'rotate-0'}`}>▼</span>
                    </button>
                    <div className={`overflow-hidden transition-all ease-in-out duration-300 ${isCitationOpen ? 'max-h-96 pt-2' : 'max-h-0'}`}>
                      <div className="flex flex-col gap-2">
                        {messageCitations.map((citation, index) => (
                         <div key={index} onClick={() => handleOpenModal(citation)} className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs cursor-pointer hover:bg-gray-300 transition-colors">
                            {citation.documentName}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        )})}
        
        {isBotLoading && (
          <div className="mb-6 flex gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 bg-[#28a745] text-white">A</div>
            <div className="p-4 rounded-xl max-w-[70%] leading-relaxed bg-[#f8f9fa]">
                <div className="flex items-center justify-center h-full gap-1">
                  <div className="loading-dot"></div><div className="loading-dot"></div><div className="loading-dot"></div>
                </div>
            </div>
          </div>
        )}

        {showAgentTrigger && (
            <div className="flex justify-center my-4">
                <button 
                    onClick={handleRequestAgent}
                    disabled={isRequestingAgent}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center disabled:bg-gray-400"
                >
                    {isRequestingAgent ? <Loader2 className="w-5 h-5 mr-2 animate-spin"/> : <UserCheck className="w-5 h-5 mr-2" />}
                    {isRequestingAgent ? 'Menghubungkan...' : 'Bicara dengan Agen'}
                </button>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-5 bg-white border-t border-[#e9ecef]">
        <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
            className="flex-1 py-3 px-4 border border-[#dee2e6] rounded-[24px] text-sm resize-none min-h-[48px] max-h-[120px] focus:outline-none focus:border-[#4c6ef5]"
            placeholder={chatMode === 'bot' ? "Ketik pertanyaan Anda..." : "Ketik balasan untuk agen..."}
            rows={1}
            disabled={showAgentTrigger}
          />
          <button 
            type="submit" 
            className="w-12 h-12 bg-[#4c6ef5] rounded-full text-white cursor-pointer flex items-center justify-center hover:bg-[#364fc7] disabled:bg-gray-300" 
            disabled={isBotLoading || isSendingToAgent || showAgentTrigger}
          >
            {isSendingToAgent ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}
          </button>
        </form>
      </div>
      
      {selectedCitation && (
        <CitationModal 
          citation={selectedCitation}
          onClose={handleCloseModal}
        />
      )}

      <style>{`
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
        .loading-dot { height: 8px; width: 8px; background-color: #9ca3af; border-radius: 9999px; animation: bounce 1.2s infinite ease-in-out; }
        .loading-dot:nth-of-type(2) { animation-delay: -0.2s; }
        .loading-dot:nth-of-type(3) { animation-delay: -0.4s; }
      `}</style>
    </div>
  );
};

export default ServicePublicChat;
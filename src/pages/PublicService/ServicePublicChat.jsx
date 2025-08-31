import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/hooks/useAuth';
import CitationModal from './components/CitationModal';


const ServicePublicChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [citations, setCitations] = useState([]);
  
  // 1. State baru untuk mengelola status dropdown sitasi per pesan
  const [openCitations, setOpenCitations] = useState({});
  const [selectedCitation, setSelectedCitation] = useState(null);


  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { authState } = useAuth();
  const userData = authState?.user ||'';
  const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';

  useEffect(() => {
    setMessages([{ 
      id: 'initial',
      sender: 'agent',
      text: `Halo ${userData.name || 'User'}. Saya adalah AI Assistant dari Dokuprime. Ada yang bisa saya bantu?` 
    }]);
  }, []);

  useEffect(() => {
    if (messages.length > 1) { // Hindari scroll pada pesan awal
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };
  
  // 2. Fungsi untuk toggle dropdown
  const toggleCitations = (messageId) => {
    setOpenCitations(prev => ({
      ...prev,
      [messageId]: !prev[messageId] // Balikkan status (true -> false, false -> true)
    }));
  };

  // 3. FUNGSI BARU untuk membuka dan menutup modal
  const handleOpenModal = (citation) => {
    setSelectedCitation(citation);
  };
  const handleCloseModal = () => {
    setSelectedCitation(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === '' || loading) return;

    const userMessage = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInput('');
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
    
    const botMessageId = `agent-${Date.now()}`;

    try {
      const response = await fetch('http://localhost/v1/chat-messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_DIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {}, query: input, response_mode: 'streaming',
          conversation_id: conversationId || '', user: userData?.name || 'default-user', files: [],
        }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullResponse = '';
      let isFirstChunk = true;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
        
        for (const line of lines) {
          try {
            const jsonStr = line.replace('data: ', '');
            if (!jsonStr) continue;
            
            const data = JSON.parse(jsonStr);

            if (data.conversation_id) setConversationId(data.conversation_id);
            
            if (data.event === 'message' || data.event === 'agent_message') {
              fullResponse += data.answer;
              
              if (isFirstChunk) {
                setMessages(prev => [...prev, { id: botMessageId, sender: 'agent', text: fullResponse }]);
                isFirstChunk = false;
              } else {
                setMessages(prev => prev.map(msg => 
                  msg.id === botMessageId ? { ...msg, text: fullResponse } : msg
                ));
              }
            }

            if (data.event === 'message_end' && data.metadata?.retriever_resources) {
              const newCitations = data.metadata.retriever_resources.map(resource => ({
                messageId: botMessageId,
                documentName: resource.document_name,
                content: resource.content, // <-- TAMBAHKAN BARIS INI
              }));
              setCitations(prev => [...prev, ...newCitations]);
            }
          } catch (error) { /* Abaikan error parsing */ }
        }
      }
    } catch (error) {
      console.error('Error fetching chatbot response:', error);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`, sender: 'agent', text: 'Maaf, terjadi kesalahan saat menghubungi server.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-[1200px] mx-auto w-full h-full">
      <div className="flex-1 p-6 overflow-y-auto bg-white m-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
        {messages.map((msg) => {
          // Filter sitasi hanya untuk pesan saat ini
          const messageCitations = citations.filter(c => c.messageId === msg.id);
          const hasCitations = messageCitations.length > 0;
          const isCitationOpen = openCitations[msg.id];

          return (
            <div key={msg.id} className={`mb-6 flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 text-white ${
                  msg.sender === 'user' ? 'bg-[#4c6ef5]' : 'bg-[#28a745]'
              }`}>
                {msg.sender === 'user' ? userInitial : 'A'}
              </div>
              <div className={`p-4 rounded-xl max-w-[70%] leading-relaxed ${
                  msg.sender === 'user' ? 'bg-[#4c6ef5] text-white' : 'bg-[#f8f9fa] text-gray-800'
              }`}>
                <p className="whitespace-pre-wrap m-0">{msg.text}</p>
                
                {/* 3. JSX yang telah diubah untuk dropdown sitasi */}
                {hasCitations && (
                  <div className={`mt-4 pt-3 border-t ${msg.sender === 'user' ? 'border-blue-300' : 'border-gray-200'}`}>
                    <button 
                      onClick={() => toggleCitations(msg.id)}
                      className="w-full flex justify-between items-center text-left text-xs font-semibold text-gray-500 mb-2 focus:outline-none"
                    >
                      <span>SUMBER ({messageCitations.length})</span>
                      <span className={`transform transition-transform duration-300 ${isCitationOpen ? 'rotate-180' : 'rotate-0'}`}>
                        ▼
                      </span>
                    </button>
                    
                    {/* Kontainer yang bisa show/hide dengan transisi smooth */}
                    <div className={`overflow-hidden transition-all ease-in-out duration-300 ${isCitationOpen ? 'max-h-96 pt-2' : 'max-h-0'}`}>
                      <div className="flex flex-col gap-2">
                        {messageCitations.map((citation, index) => (
                         <div 
                            key={index}
                            onClick={() => handleOpenModal(citation)}
                            className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs cursor-pointer hover:bg-gray-300 transition-colors"
                          >
                            {citation.documentName}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {loading && (
          // ... (Loading indicator tidak berubah) ...
          <div className="mb-6 flex gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 bg-[#28a745] text-white">A</div>
            <div className="p-4 rounded-xl max-w-[70%] leading-relaxed bg-[#f8f9fa]">
                <div className="flex items-center justify-center h-full gap-1">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ... (Input form tidak berubah) ... */}
      <div className="p-5 bg-white border-t border-[#e9ecef]">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
            className="flex-1 py-3 px-4 border border-[#dee2e6] rounded-[24px] text-sm resize-none min-h-[48px] max-h-[120px] focus:outline-none focus:border-[#4c6ef5]"
            placeholder="Ketik pertanyaan Anda..."
            rows={1}
          />
          <button 
            type="submit" 
            className="w-12 h-12 bg-[#4c6ef5] rounded-full text-white cursor-pointer flex items-center justify-center hover:bg-[#364fc7] disabled:bg-gray-300" 
            disabled={loading}
          >
            ➤
          </button>
        </form>
      </div>

       {/* 5. RENDER MODAL SECARA KONDISIONAL */}
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
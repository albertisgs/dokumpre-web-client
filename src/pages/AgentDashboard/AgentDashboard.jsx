// src/pages/AgentDashboard/AgentDashboard.jsx (Diperbarui)

import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Send, PhoneOff, Inbox } from "lucide-react";
import { useAuth } from "../../context/hooks/useAuth";
import { useAgentStore } from "../../layouts/store/useAgentStore";

const ChatMessage = ({ msg, agent, user }) => {
  const senderType = msg.sender_type;

  // 1. Tangani pesan 'sistem' secara terpisah sebagai notifikasi
  if (senderType === "system") {
    return (
      <div className="my-4 text-center">
        <span className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
          {msg.message_text || msg.text}
        </span>
      </div>
    );
  }

  // 2. Tentukan properti untuk pesan tipe 'user', 'agent', dan 'bot'
  const isFromUser = senderType === "user";

  let avatarInitial = "";
  if (isFromUser) {
    avatarInitial = user?.name?.charAt(0).toUpperCase() || "U";
  } else if (senderType === "agent") {
    avatarInitial = agent.name?.charAt(0).toUpperCase() || "A";
  } else {
    // Ini akan menangani 'bot'
    avatarInitial = "B"; // Inisial untuk Bot
  }

  // Tentukan warna dan posisi bubble
  const avatarColor = isFromUser ? "bg-blue-500" : "bg-green-500";
  const bubbleColor = isFromUser
    ? "bg-white border"
    : "bg-green-100 text-gray-800";
  const alignment = isFromUser ? "" : "flex-row-reverse";

  return (
    <div className={`flex items-end gap-3 my-4 ${alignment}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${avatarColor}`}
      >
        {avatarInitial}
      </div>
      <div className={`p-3 rounded-lg max-w-[70%] ${bubbleColor}`}>
        <p className="text-sm" style={{ whiteSpace: "pre-wrap" }}>
          {msg.message_text || msg.text}
        </p>
        <div className={`text-xs mt-1 text-right text-gray-500`}>
          {new Date(msg.timestamp).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

const TranscriptViewer = () => {
  const { selectedHistoryTranscript: session, isTranscriptLoading } =
    useAgentStore();

  if (isTranscriptLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  if (!session) return null;

  return (
    <div className="flex flex-col h-full bg-white m-4 rounded-lg shadow-sm">
      <div className="p-4">
        <h3 className="font-bold">
          Transkrip dengan: {session.user_name || "User"}
        </h3>
        <p className="text-xs text-gray-500">
          Selesai pada: {new Date(session.ended_at).toLocaleString("id-ID")}
        </p>
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <pre className="text-sm whitespace-pre-wrap font-sans">
          {session.transcript}
        </pre>
      </div>
    </div>
  );
};

const LiveChatWindow = () => {
  const { authState } = useAuth();
  const { activeChat, endSession, sendMessage } = useAgentStore();
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // --- DATA QUICK RESPONSE STATIS ---
  const quickResponses = {
    greeting:
      "Halo! Selamat datang di layanan pelanggan Dokuprime. Ada yang bisa saya bantu?",
    understand: "Baik, saya mengerti maksud Anda.",
    checking:
      "Mohon tunggu sebentar, saya sedang memeriksa informasi untuk Anda.",
    documents:
      "Untuk melanjutkan proses ini, bisakah Anda memberikan dokumen yang diperlukan?",
    followup:
      "Terima kasih atas informasinya. Saya akan segera menindaklanjuti permintaan Anda.",
    resolved:
      "Apakah ada hal lain yang bisa saya bantu? Jika tidak, saya akan menutup sesi ini.",
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.allMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;
    sendMessage(activeChat.id, messageInput, authState.user.id);
    setMessageInput("");
  };

  const handleResolveChat = () => {
    if (window.confirm("Apakah Anda yakin ingin menyelesaikan sesi ini?")) {
      endSession(activeChat.id);
    }
  };

  const insertQuickResponse = (responseText) => {
    setMessageInput((prev) =>
      prev ? `${prev}\n${responseText}`.trim() : responseText
    );
    textareaRef.current?.focus();
  };

  if (!activeChat) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-gray-500 p-8 text-center">
        <PhoneOff className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">
          Tidak Ada Sesi Aktif
        </h3>
        <p className="text-gray-600 mt-2">
          Pilih percakapan dari antrian untuk memulai.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 m-4 rounded-lg shadow-sm">
      <div className="p-4 flex justify-between items-center bg-white rounded-t-lg">
        <h3 className="font-bold">{activeChat.user_name}</h3>
        <button
          onClick={handleResolveChat}
          className="bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-green-700"
        >
          Selesaikan Sesi
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {activeChat.allMessages?.map((msg, index) => (
          <ChatMessage
            key={msg.id || `msg-${index}`}
            msg={msg}
            agent={authState.user}
            user={{ name: activeChat.user_name }}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className=" bg-white rounded-b-lg">
        <div className="bg-gray-50 border-t border-gray-200 px-4 pb-3 pt-2">
          <div className="text-xs text-gray-600 mb-2 font-medium">
            Quick Responses:
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(quickResponses).map(([key, value]) => (
              <button
                key={key}
                onClick={() => insertQuickResponse(value)}
                className="px-3 py-1 bg-white border border-gray-300 rounded-2xl text-xs cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all text-gray-700"
              >
                {key.charAt(0).toUpperCase() +
                  key.slice(1).replace(/([A-Z])/g, " $1")}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSendMessage}
          className="p-4 flex items-center gap-3"
        >
          <textarea
            ref={textareaRef}
            className="w-full p-2 rounded-md resize-none"
            placeholder="Ketik balasan Anda..."
            rows="2"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!messageInput.trim()}
            className="bg-blue-600 text-white p-2 rounded-full h-10 w-10 flex-shrink-0 flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

const AgentDashboard = () => {
  const { sessionId } = useParams();
  const { activeChat, selectedHistoryTranscript, isInitialized } =
    useAgentStore();

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (sessionId && activeChat && activeChat.id === sessionId) {
    console.log("line 244", sessionId, activeChat.id)
    return <LiveChatWindow />;
  }

  if (selectedHistoryTranscript) {
    return <TranscriptViewer />;
  }

  return (
    <div className="flex flex-col justify-center items-center h-full text-gray-500 p-8 text-center">
      <Inbox className="w-16 h-16 text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700">
        Selamat Datang di Dashboard Agen
      </h3>
      <p className="text-gray-600 mt-2">
        Pilih percakapan dari antrian atau riwayat di sidebar untuk memulai.
      </p>
    </div>
  );
};

export default AgentDashboard;

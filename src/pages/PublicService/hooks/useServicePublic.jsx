// src/pages/PublicService/hooks/useServicePublicChat.js
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Pusher from "pusher-js";
import toast from "react-hot-toast";
import axiosInstance from "../../../axios/axiosInstance";
import { useAuth } from "../../../context/hooks/useAuth";

// --- Kumpulan Fungsi API ---
const fetchUserSessions = async () => {
  const { data } = await axiosInstance.generalSession.get(
    "/api/live-chat/sessions"
  );
  return data;
};

const fetchSessionHistory = async (sessionId) => {
  // Panggil endpoint BARU yang aman untuk pengguna
  const { data } = await axiosInstance.generalSession.get(
    `/api/live-chat/sessions/${sessionId}/history`
  );
  return data;
};

const requestChatWithAgent = async (difyConversationId) => {
  const { data } = await axiosInstance.generalSession.post(
    "/api/live-chat/request-session",
    {
      dify_conversation_id: difyConversationId,
    }
  );
  return data;
};

const postUserMessageToAgent = async ({ sessionId, text }) => {
  const { data } = await axiosInstance.generalSession.post(
    `/api/live-chat/sessions/${sessionId}/send-message`,
    { text }
  );
  return data;
};

export const useServicePublicChat = () => {
  const queryClient = useQueryClient();
  const { authState } = useAuth();

  // --- State Management ---
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [difyConversationId, setDifyConversationId] = useState(null);
  const [liveChatSessionId, setLiveChatSessionId] = useState(null); // Ini menjadi null di awal
  const [chatMode, setChatMode] = useState("bot");
  const [isBotLoading, setIsBotLoading] = useState(false);
  const [showAgentTrigger, setShowAgentTrigger] = useState(false);
  const [citations, setCitations] = useState([]);
  const [openCitations, setOpenCitations] = useState({});
  const [selectedCitation, setSelectedCitation] = useState(null);

  // --- (BARU) State untuk mengelola sesi ---
  const [isSessionView, setIsSessionView] = useState(true); // Tampilkan pilihan sesi di awal
  const [isRestoringSession, setIsRestoringSession] = useState(false);

  // --- (BARU) Query untuk mengambil sesi aktif pengguna ---
  const { data: activeSessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["userChatSessions"],
    queryFn: fetchUserSessions,
    enabled: !!authState.user, // Hanya jalankan jika user sudah login
  });

  const { mutate: requestAgent, isPending: isRequestingAgent } = useMutation({
    mutationFn: requestChatWithAgent,
    onSuccess: (data) => {
      setLiveChatSessionId(data.session_id);
      setShowAgentTrigger(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          sender: "system",
          text: "Permintaan Anda telah dikirim. Harap tunggu agen untuk terhubung.",
        },
      ]);
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.detail || "Gagal meminta koneksi ke agen."
      ),
  });

  const { mutate: sendMessageToAgent, isPending: isSendingToAgent } =
    useMutation({
      mutationFn: postUserMessageToAgent,
      onSuccess: () => setInput(""),
      onError: (error) =>
        toast.error(error.response?.data?.detail || "Gagal mengirim pesan."),
    });

  // (BARU) Fungsi untuk menangani saat user memilih sesi yang ada
  const handleSelectSession = async (session) => {
        setIsRestoringSession(true);
        setLiveChatSessionId(session.id);
        
        if (session.status === 'active' || session.status === 'queued') {
            try {
                const historyData = await fetchSessionHistory(session.id);
                
                // --- PERBAIKAN UTAMA ADA DI SINI ---
                // Kita akan memetakan semua pesan ke format yang konsisten (menggunakan 'text')
                const allMessages = historyData.messages.map(msg => ({
                    id: msg.id,
                    sender: msg.sender_type, // Ubah sender_type menjadi sender
                    text: msg.message_text,  // Ubah message_text menjadi text
                    timestamp: msg.timestamp,
                })).sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
                
                setMessages(allMessages);
                setChatMode(historyData.status === 'active' ? 'agent' : 'bot');

            } catch (error) {
                toast.error("Gagal memuat riwayat chat.");
                setLiveChatSessionId(null);
            }
        }
        setIsSessionView(false);
        setIsRestoringSession(false);
    };

  // (BARU) Fungsi untuk membuat sesi baru (mulai dengan bot)
  const handleCreateNewSession = () => {
    setMessages([
      {
        id: "initial",
        sender: "agent",
        text: `Halo ${
          authState.user?.name || "User"
        }. Saya adalah AI Assistant dari Dokuprime. Ada yang bisa saya bantu?`,
      },
    ]);
    setLiveChatSessionId(null); // Pastikan ID sesi lama kosong
    setDifyConversationId(null); // Mulai percakapan Dify baru
    setChatMode("bot");
    setIsSessionView(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "" || isBotLoading || isSendingToAgent) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");

    if (chatMode === "bot") {
      setIsBotLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_DITY_CHAT}/chat-messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_DIFY_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputs: {},
              query: currentInput,
              response_mode: "streaming",
              conversation_id: difyConversationId || "",
              user: authState.user?.name || "default-user",
            }),
          }
        );

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";
        const botMessageId = `bot-${Date.now()}`;
        let isFirstChunk = true;

        let readerDone = false;
        while (!readerDone) {
          const { value, done } = await reader.read();
          readerDone = done;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk
            .split("\n")
            .filter((line) => line.startsWith("data: "));

          for (const line of lines) {
            try {
              const jsonStr = line.replace("data: ", "");
              if (!jsonStr) continue;
              const data = JSON.parse(jsonStr);

              if (data.conversation_id)
                setDifyConversationId(data.conversation_id);

              if (data.event === "message" || data.event === "agent_message") {
                fullResponse += data.answer;
                if (isFirstChunk) {
                  setMessages((prev) => [
                    ...prev,
                    { id: botMessageId, sender: "agent", text: fullResponse },
                  ]);
                  isFirstChunk = false;
                } else {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMessageId
                        ? { ...msg, text: fullResponse }
                        : msg
                    )
                  );
                }
              }

              if (
                data.event === "message_end" &&
                data.metadata?.retriever_resources
              ) {
                const newCitations = data.metadata.retriever_resources.map(
                  (resource) => ({
                    messageId: botMessageId,
                    documentName: resource.document_name,
                    content: resource.content,
                  })
                );
                setCitations((prev) => [...prev, ...newCitations]);
              }
            } catch (error) {
              /* Abaikan error parsing */
            }
          }
        }

        if (fullResponse.includes("<trigger_agent>")) {
          setShowAgentTrigger(true);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? {
                    ...msg,
                    text: fullResponse.replace("<trigger_agent>", "").trim(),
                  }
                : msg
            )
          );
        }
      } catch (error) {
        console.error("Chatbot API error:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: "agent",
            text: "Maaf, terjadi kesalahan.",
          },
        ]);
      } finally {
        setIsBotLoading(false);
      }
    } else if (chatMode === "agent") {
      sendMessageToAgent({ sessionId: liveChatSessionId, text: currentInput });
    }
  };

  const toggleCitations = (messageId) => {
    setOpenCitations((prev) => ({ ...prev, [messageId]: !prev[messageId] }));
  };
  const handleOpenModal = (citation) => setSelectedCitation(citation);
  const handleCloseModal = () => setSelectedCitation(null);

   useEffect(() => {
    const pusherKey = import.meta.env.VITE_PUSHER_KEY;
    const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER;
    if (!pusherKey || !pusherCluster || !authState.user?.id) return;

    const pusher = new Pusher(pusherKey, { cluster: pusherCluster });
    const userChannelName = `user-chat-${authState.user.id}`;
    const userChannel = pusher.subscribe(userChannelName);

    userChannel.bind("agent-connected", (data) => {
      if (data.session_id === liveChatSessionId) {
        setChatMode("agent");
        toast.success(`Agen ${data.agent_name} telah terhubung!`);
        setMessages((prev) => [...prev, { id: `system-${Date.now()}`, sender: "system", text: `Anda sekarang terhubung dengan ${data.agent_name}.` }]);
      }
    });

    userChannel.bind("session-resolved", (data) => {
        if (data.session_id === liveChatSessionId) {
            setChatMode("bot");
            setLiveChatSessionId(null);
            toast.success("Sesi chat dengan agen telah berakhir.");
            setIsSessionView(true);
        }
    });
    
    userChannel.bind("agent-transferred", (data) => {
        if (data.session_id === liveChatSessionId) {
            toast.info("Percakapan Anda dialihkan ke agen lain.");
            queryClient.invalidateQueries({ queryKey: ['userChatSessions'] });
        }
    });

    let sessionChannel;
    if (liveChatSessionId) {
      const channelName = `chat-session-${liveChatSessionId}`;
      sessionChannel = pusher.subscribe(channelName);
      
      sessionChannel.bind("new_message", (newMessage) => {
        // --- PERBAIKAN UTAMA DI SINI ---
        // Cek apakah pengirim pesan BUKAN user saat ini.
        if (newMessage.sender_id !== authState.user.id) {
          setMessages((prev) => [
            ...prev,
            {
              id: newMessage.id,
              sender: newMessage.sender_type,
              text: newMessage.message_text,
              timestamp: newMessage.timestamp,
            },
          ]);
        }
      });
    }

    return () => {
      pusher.unsubscribe(userChannelName);
      if (sessionChannel) pusher.unsubscribe(sessionChannel.name);
    };
  }, [liveChatSessionId, authState.user?.id, queryClient]); // Hapus chatMode dari dependency array

  return {
    messages,
    input,
    setInput,
    chatMode,
    isBotLoading,
    showAgentTrigger,
    isRequestingAgent,
    requestAgent,
    handleSendMessage,
    isSendingToAgent,
    citations,
    openCitations,
    selectedCitation,
    toggleCitations,
    handleOpenModal,
    handleCloseModal,
    difyConversationId,
    // (BARU) Ekspor state dan fungsi baru
    isSessionView,
    activeSessions,
    isLoadingSessions,
    handleSelectSession,
    handleCreateNewSession,
    isRestoringSession,
  };
};

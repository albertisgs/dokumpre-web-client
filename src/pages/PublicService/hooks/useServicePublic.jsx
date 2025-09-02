// src/pages/PublicService/hooks/useServicePublicChat.js
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import Pusher from "pusher-js";
import toast from "react-hot-toast";
import axiosInstance from "../../../axios/axiosInstance";
import { useAuth } from "../../../context/hooks/useAuth";

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
    `/api/live-chat/${sessionId}/send-message`,
    { text }
  ); // Endpoint ini belum ada di backend, perlu dibuat
  return data;
};

export const useServicePublicChat = () => {
  const { authState } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [difyConversationId, setDifyConversationId] = useState(null);
  const [liveChatSessionId, setLiveChatSessionId] = useState(null);
  const [chatMode, setChatMode] = useState("bot"); // 'bot' or 'agent'
  const [isBotLoading, setIsBotLoading] = useState(false);
  const [showAgentTrigger, setShowAgentTrigger] = useState(false);
  const [citations, setCitations] = useState([]);
  const [openCitations, setOpenCitations] = useState({});
  const [selectedCitation, setSelectedCitation] = useState(null);

  const toggleCitations = (messageId) => {
    setOpenCitations((prev) => ({ ...prev, [messageId]: !prev[messageId] }));
  };
  const handleOpenModal = (citation) => setSelectedCitation(citation);
  const handleCloseModal = () => setSelectedCitation(null);

  useEffect(() => {
    setMessages([
      {
        id: "initial",
        sender: "agent",
        text: `Halo ${
          authState.user?.name || "User"
        }. Saya adalah AI Assistant dari Dokuprime. Ada yang bisa saya bantu?`,
      },
    ]);
  }, [authState.user]);

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
        let isFirstChunk = true; // <-- DIKEMBALIKAN

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

              // --- FIX: KEMBALIKAN LOGIKA LAMA ---
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
              // --- AKHIR FIX ---

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
          // Hapus trigger_agent dari pesan terakhir
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
      // Jika mode agent
      sendMessageToAgent({ sessionId: liveChatSessionId, text: currentInput });
    }
  };

  useEffect(() => {
    const pusherKey = import.meta.env.VITE_PUSHER_KEY;
    const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER;
    if (!pusherKey || !pusherCluster) return;

    const pusher = new Pusher(pusherKey, { cluster: pusherCluster });
    let sessionChannel;

    if (liveChatSessionId) {
      sessionChannel = pusher.subscribe(`chat-session-${liveChatSessionId}`);
      sessionChannel.bind("new-message", (newMessage) => {
        setMessages((prev) => [
          ...prev,
          {
            id: newMessage.id,
            sender: newMessage.sender_type,
            text: newMessage.message_text,
            timestamp: newMessage.timestamp,
          },
        ]);
      });
      sessionChannel.bind("session-ended", () => {
        setChatMode("bot");
        setLiveChatSessionId(null);
        toast.success("Sesi chat dengan agen telah berakhir.");
        setMessages((prev) => [
          ...prev,
          {
            id: `system-${Date.now()}`,
            sender: "system",
            text: "Sesi chat berakhir.",
          },
        ]);
      });
    }

    const userChannelName = `user-chat-${authState.user?.id}`;
    const userChannel = pusher.subscribe(userChannelName);
    userChannel.bind("agent-connected", (data) => {
      if (data.session_id === liveChatSessionId) {
        setChatMode("agent");
        toast.success("Agen telah terhubung!");
        setMessages((prev) => [
          ...prev,
          {
            id: `system-${Date.now()}`,
            sender: "system",
            text: "Agen telah terhubung.",
          },
        ]);
      }
    });

    return () => {
      pusher.unsubscribe(userChannelName);
      if (liveChatSessionId)
        pusher.unsubscribe(`chat-session-${liveChatSessionId}`);
    };
  }, [liveChatSessionId, authState.user?.id]);

  return {
    messages,
    setMessages,
    input,
    setInput,
    difyConversationId,
    liveChatSessionId,
    chatMode,
    setChatMode,
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
  };
};

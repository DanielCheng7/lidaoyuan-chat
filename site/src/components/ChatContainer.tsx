"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChatMessage, Conversation } from "@/lib/types";
import {
  loadConversations,
  loadActiveId,
  createConversation,
  updateConversationMessages,
  deleteConversation,
  setActiveConversation,
} from "@/lib/storage";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import WelcomeScreen from "./WelcomeScreen";
import ErrorBar from "./ErrorBar";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function parseSSEChunk(chunk: string): string {
  let result = "";
  const lines = chunk.split("\n");
  for (const line of lines) {
    if (line.startsWith("data: ") && line !== "data: [DONE]") {
      try {
        const json = JSON.parse(line.slice(6));
        const content = json.choices?.[0]?.delta?.content;
        if (content) result += content;
      } catch {
        // skip
      }
    }
  }
  return result;
}

export default function ChatContainer() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initRef = useRef(false);

  // Load initial state
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const convs = loadConversations();
    const active = loadActiveId();
    setConversations(convs);
    if (active) {
      setActiveId(active);
      const activeConv = convs.find((c) => c.id === active);
      if (activeConv) setMessages(activeConv.messages);
    }
  }, []);

  // Persist messages changes
  const persistRef = useRef(false);
  useEffect(() => {
    if (!persistRef.current) {
      persistRef.current = true;
      return;
    }
    if (!activeId) return;
    const title =
      messages.find((m) => m.role === "user")?.content.slice(0, 30) || "新对话";
    updateConversationMessages(activeId, messages, title);
    // Also refresh sidebar list
    setConversations(loadConversations());
  }, [messages, activeId]);

  const streamChat = useCallback(
    async (apiMessages: Array<{ role: string; content: string }>, assistantId: string) => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: "请求失败" }));
          throw new Error(err.error || `HTTP ${response.status}`);
        }

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const delta = parseSSEChunk(chunk);
          if (delta) {
            fullContent += delta;
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.id === assistantId) {
                updated[updated.length - 1] = { ...last, content: fullContent };
              }
              return updated;
            });
          }
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "未知错误";
        setError(msg);
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      setError(null);

      // Create conversation if needed
      let convId = activeId;
      if (!convId) {
        const conv = createConversation(text);
        convId = conv.id;
        setActiveId(conv.id);
        setConversations(loadConversations());
      }

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
      };
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setIsLoading(true);

      const updatedMessages = [...messages, userMsg, assistantMsg];
      const apiMessages = updatedMessages
        .filter((m) => m.role === "user" || (m.role === "assistant" && m.content))
        .map((m) => ({ role: m.role, content: m.content }));

      await streamChat(apiMessages, assistantMsg.id);
    },
    [activeId, isLoading, messages, streamChat]
  );

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      sendMessage(input);
    },
    [input, sendMessage]
  );

  const handleExampleClick = useCallback(
    (question: string) => {
      sendMessage(question);
    },
    [sendMessage]
  );

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversation(id);
    setActiveId(id);
    const convs = loadConversations();
    setConversations(convs);
    const conv = convs.find((c) => c.id === id);
    setMessages(conv?.messages ?? []);
    setError(null);
    setSidebarOpen(false);
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setActiveId(null);
    setError(null);
    setSidebarOpen(false);
  }, []);

  const handleDeleteConversation = useCallback(
    (id: string) => {
      deleteConversation(id);
      const convs = loadConversations();
      setConversations(convs);
      if (activeId === id) {
        const next = convs[0];
        if (next) {
          setActiveId(next.id);
          setMessages(next.messages);
          setActiveConversation(next.id);
        } else {
          setActiveId(null);
          setMessages([]);
        }
      }
    },
    [activeId]
  );

  const handleRetry = useCallback(() => {
    setError(null);
    // Re-send last user message
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) {
      // Remove failed assistant message
      const cleanMessages = messages.filter(
        (m) => m.role !== "assistant" || m.content
      );
      setMessages(cleanMessages);
      sendMessage(lastUser.content);
    }
  }, [messages, sendMessage]);

  const showWelcome = messages.length === 0 && !isLoading;
  const showMessages = messages.length > 0;

  return (
    <div className="flex h-dvh max-w-[960px] mx-auto">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        isOpen={sidebarOpen}
        onSelect={handleSelectConversation}
        onDelete={handleDeleteConversation}
        onNew={handleNewChat}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 border-l border-bamboo">
        <Header
          onNewChat={handleNewChat}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          hasSidebar={true}
        />

        <div className="flex-1 flex flex-col min-h-0">
          {showWelcome ? (
            <div className="flex-1 overflow-y-auto">
              <WelcomeScreen onExampleClick={handleExampleClick} />
            </div>
          ) : showMessages ? (
            <MessageList messages={messages} isLoading={isLoading} />
          ) : null}
        </div>

        {error && (
          <ErrorBar
            message={error}
            onRetry={handleRetry}
            onDismiss={() => setError(null)}
          />
        )}

        <MessageInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChatMessage } from "@/lib/types";
import { saveMessages, loadMessages, clearMessages } from "@/lib/storage";
import Header from "./Header";
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
        // skip unparseable lines
      }
    }
  }
  return result;
}

export default function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const initRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);

  // Keep ref in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Load saved messages once
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const saved = loadMessages();
    if (saved && saved.length > 0) {
      setMessages(saved);
      setShowWelcome(false);
    }
  }, []);

  // Persist on change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages]);

  const streamChat = useCallback(
    async (allMessages: Array<{ role: string; content: string }>, assistantId: string) => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: allMessages }),
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

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const text = input.trim();
      if (!text || isLoading) return;

      setShowWelcome(false);
      setError(null);

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      };
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      const updated = [...messagesRef.current, userMsg, assistantMsg];
      setMessages(updated);
      setInput("");
      setIsLoading(true);

      const apiMessages = updated
        .filter((m) => m.role === "user" || (m.role === "assistant" && m.content))
        .map((m) => ({ role: m.role, content: m.content }));

      streamChat(apiMessages, assistantMsg.id);
    },
    [input, isLoading, streamChat]
  );

  const handleExampleClick = useCallback(
    (question: string) => {
      if (isLoading) return;

      setShowWelcome(false);
      setError(null);

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: question,
        timestamp: Date.now(),
      };
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      const updated = [...messagesRef.current, userMsg, assistantMsg];
      setMessages(updated);
      setInput("");
      setIsLoading(true);

      const apiMessages = updated
        .filter((m) => m.role === "user" || (m.role === "assistant" && m.content))
        .map((m) => ({ role: m.role, content: m.content }));

      streamChat(apiMessages, assistantMsg.id);
    },
    [isLoading, streamChat]
  );

  const handleNewChat = useCallback(() => {
    if (messages.length === 0) return;
    setMessages([]);
    clearMessages();
    setShowWelcome(true);
    setError(null);
  }, [messages.length]);

  const handleRetry = useCallback(() => {
    setError(null);
    handleSubmit();
  }, [handleSubmit]);

  return (
    <div className="flex flex-col h-dvh max-w-[720px] mx-auto">
      <Header onNewChat={handleNewChat} />

      <div className="flex-1 flex flex-col min-h-0">
        {showWelcome ? (
          <div className="flex-1 overflow-y-auto">
            <WelcomeScreen onExampleClick={handleExampleClick} />
          </div>
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
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
  );
}

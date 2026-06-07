"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChatMessage } from "@/lib/types";
import MessageBubble from "./MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onRegenerate?: () => void;
}

export default function MessageList({ messages, isLoading, onRegenerate }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
    setUserScrolledUp(false);
  }, []);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setUserScrolledUp(fromBottom > 150);
  }, []);

  useEffect(() => {
    if (!userScrolledUp) {
      scrollToBottom();
    }
  }, [messages, userScrolledUp, scrollToBottom]);

  useEffect(() => {
    if (isLoading) {
      scrollToBottom();
    }
  }, [isLoading, scrollToBottom]);

  // Find the last AI message index for regenerate
  const lastAiIndex = [...messages].reverse().findIndex((m) => m.role === "assistant");
  const lastAiIdx = lastAiIndex >= 0 ? messages.length - 1 - lastAiIndex : -1;

  return (
    <div className="relative flex-1">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-auto px-4 py-6"
      >
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-pencil/40">开始你的第一个问题</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isStreaming={isLoading && i === messages.length - 1 && msg.role === "assistant"}
            onRegenerate={i === lastAiIdx && !isLoading ? onRegenerate : undefined}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {userScrolledUp && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-seal text-white shadow-md flex items-center justify-center cursor-pointer hover:bg-seal/90"
          aria-label="回到底部"
        >
          ↓
        </button>
      )}
    </div>
  );
}

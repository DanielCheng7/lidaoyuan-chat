"use client";

import { useState } from "react";
import { ChatMessage } from "@/lib/types";
import MarkdownContent from "./MarkdownContent";

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
  onRegenerate?: () => void;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageBubble({
  message,
  isStreaming,
  onRegenerate,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} mb-4`}>
      {/* Timestamp above */}
      <span className={`text-xs text-pencil/40 mb-1 px-1 ${isUser ? "text-right" : "text-left"}`}>
        {formatTime(message.timestamp)}
      </span>

      <div
        className={`max-w-[85%] px-4 py-3 rounded-lg ${
          isUser
            ? "bg-[#4A3728] text-white rounded-bl-lg rounded-br-none"
            : "bg-paper-deep text-ink rounded-br-lg rounded-bl-none vertical-line"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
        ) : (
          <div className={`text-[15px] leading-relaxed ${isStreaming ? "cursor-blink" : ""}`}>
            <MarkdownContent content={message.content} />
          </div>
        )}
      </div>

      {/* Actions below — AI messages only */}
      {!isUser && !isStreaming && message.content && (
        <div className="flex items-center gap-2 mt-1 px-1">
          <button
            onClick={handleCopy}
            className="text-[11px] text-pencil/40 hover:text-pencil cursor-pointer"
          >
            {copied ? "已复制" : "复制"}
          </button>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="text-[11px] text-pencil/40 hover:text-pencil cursor-pointer"
            >
              重新生成
            </button>
          )}
        </div>
      )}
    </div>
  );
}

import { ChatMessage } from "@/lib/types";
import MarkdownContent from "./MarkdownContent";

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export default function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
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
    </div>
  );
}

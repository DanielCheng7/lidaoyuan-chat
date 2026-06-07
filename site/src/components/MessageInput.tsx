"use client";

import { useRef, useEffect, KeyboardEvent } from "react";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  isLoading?: boolean;
  onStop?: () => void;
}

export default function MessageInput({ value, onChange, onSubmit, disabled, isLoading, onStop }: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 144) + "px";
  }, [value]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
    if (e.key === "Escape") {
      onChange("");
    }
  };

  return (
    <div className="border-t border-bamboo bg-paper/90 backdrop-blur-sm">
      <div className="max-w-[720px] mx-auto px-4 py-3">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            placeholder="向郦道元请教..."
            className="flex-1 resize-none rounded-lg border border-bamboo bg-white px-4 py-2.5 text-[15px] leading-relaxed text-ink placeholder:text-pencil/50
                       focus:outline-none focus:ring-2 focus:ring-seal/30 focus:border-seal
                       disabled:bg-paper-deep disabled:border-transparent
                       min-h-[44px] max-h-[144px]"
          />
          {isLoading ? (
            <button
              onClick={onStop}
              className="shrink-0 h-11 px-5 rounded-lg bg-error text-white font-medium text-sm
                         hover:bg-error/90 cursor-pointer transition-colors min-w-[44px] flex items-center justify-center"
            >
              停止
            </button>
          ) : (
            <button
              onClick={onSubmit}
              disabled={disabled || !value.trim()}
              className="shrink-0 h-11 px-5 rounded-lg bg-seal text-white font-medium text-sm
                         hover:bg-[#7A2A0E] disabled:opacity-40 disabled:cursor-not-allowed
                         cursor-pointer transition-colors min-w-[44px] flex items-center justify-center"
            >
              发送
            </button>
          )}
        </div>
        <p className="text-xs text-pencil/50 mt-2 text-center">
          Enter 发送 · Shift+Enter 换行
        </p>
      </div>
    </div>
  );
}

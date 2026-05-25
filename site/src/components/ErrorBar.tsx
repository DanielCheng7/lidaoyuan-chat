"use client";

import { useEffect } from "react";

interface ErrorBarProps {
  message: string;
  onRetry: () => void;
  onDismiss: () => void;
}

export default function ErrorBar({ message, onRetry, onDismiss }: ErrorBarProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="border-l-[3px] border-error bg-[#FEF2F2] px-4 py-2.5 flex items-center justify-between gap-3">
      <p className="text-sm text-error">{message}</p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onRetry}
          className="text-sm text-error font-medium hover:underline cursor-pointer"
        >
          重试
        </button>
        <button
          onClick={onDismiss}
          className="text-sm text-pencil/50 hover:text-pencil cursor-pointer"
          aria-label="关闭"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

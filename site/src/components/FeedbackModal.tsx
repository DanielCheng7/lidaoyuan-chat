"use client";

import { useState } from "react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!text.trim()) return;
    // Store feedback in localStorage for now
    try {
      const existing = JSON.parse(localStorage.getItem("lidaoyuan-feedback") || "[]");
      existing.push({
        text: text.trim(),
        time: new Date().toISOString(),
        url: window.location.href,
      });
      localStorage.setItem("lidaoyuan-feedback", JSON.stringify(existing));
    } catch {
      // ignore
    }
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setText("");
      onClose();
    }, 1500);
  };

  return (
    <>
      <div className="fixed inset-0 bg-ink/20 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md bg-paper rounded-lg border border-bamboo shadow-lg">
        <div className="px-5 py-4 border-b border-bamboo flex items-center justify-between">
          <h3 className="text-base font-medium text-ink font-[family-name:var(--font-serif)]">
            意见箱
          </h3>
          <button
            onClick={onClose}
            className="text-pencil/50 hover:text-pencil cursor-pointer text-lg"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4">
          {sent ? (
            <p className="text-sm text-moss text-center py-6">感谢反馈，已记录！</p>
          ) : (
            <>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="对郦道元有什么建议？功能需求、回答质量、任何想法都可以说……"
                rows={5}
                className="w-full resize-none rounded-lg border border-bamboo bg-white px-3 py-2.5 text-sm text-ink placeholder:text-pencil/40
                           focus:outline-none focus:ring-2 focus:ring-seal/30 focus:border-seal"
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 text-sm text-pencil hover:text-ink cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  className="px-5 py-1.5 text-sm bg-seal text-white rounded-md hover:bg-[#7A2A0E] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  提交
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

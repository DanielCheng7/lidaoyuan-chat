"use client";

import { SITE_TITLE } from "@/lib/constants";

interface HeaderProps {
  onNewChat: () => void;
  onToggleSidebar?: () => void;
  hasSidebar?: boolean;
}

export default function Header({ onNewChat, onToggleSidebar, hasSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur-sm bg-paper/80 border-b border-bamboo">
      <div className="max-w-[720px] mx-auto flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          {hasSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden text-pencil hover:text-ink cursor-pointer text-lg"
              aria-label="历史对话"
            >
              ☰
            </button>
          )}
          <h1 className="text-lg font-bold font-[family-name:var(--font-serif)] text-ink tracking-wide">
            {SITE_TITLE}
          </h1>
        </div>
        <button
          onClick={onNewChat}
          className="text-sm text-pencil hover:text-seal cursor-pointer px-3 py-1.5 rounded-md hover:bg-paper-warm"
        >
          新对话
        </button>
      </div>
    </header>
  );
}

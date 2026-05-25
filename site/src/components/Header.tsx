"use client";

import { SITE_TITLE } from "@/lib/constants";

interface HeaderProps {
  onNewChat: () => void;
}

export default function Header({ onNewChat }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur-sm bg-paper/80 border-b border-bamboo">
      <div className="max-w-[720px] mx-auto flex items-center justify-between px-4 h-14">
        <h1 className="text-lg font-bold font-[family-name:var(--font-serif)] text-ink tracking-wide">
          {SITE_TITLE}
        </h1>
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

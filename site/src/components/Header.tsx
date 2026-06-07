"use client";

import Link from "next/link";
import { SITE_TITLE } from "@/lib/constants";

interface HeaderProps {
  onNewChat: () => void;
  onToggleSidebar?: () => void;
  onFeedback?: () => void;
  hasSidebar?: boolean;
}

export default function Header({ onNewChat, onToggleSidebar, onFeedback, hasSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur-sm bg-paper/80 border-b border-bamboo">
      <div className="flex items-center justify-between px-4 h-14">
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
          <Link href="/" className="text-lg font-bold font-[family-name:var(--font-serif)] text-ink tracking-wide hover:text-seal transition-colors">
            {SITE_TITLE}
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="text-sm text-pencil/60 hover:text-pencil cursor-pointer px-2 py-1.5"
          >
            首页
          </Link>
          <button
            onClick={onFeedback}
            className="text-sm text-pencil/60 hover:text-pencil cursor-pointer px-2 py-1.5"
          >
            意见箱
          </button>
          <button
            onClick={onNewChat}
            className="text-sm text-pencil hover:text-seal cursor-pointer px-3 py-1.5 rounded-md hover:bg-paper-warm"
          >
            新对话
          </button>
        </div>
      </div>
    </header>
  );
}

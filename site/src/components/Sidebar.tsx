"use client";

import { Conversation } from "@/lib/types";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  isOpen: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onClose: () => void;
}

export default function Sidebar({
  conversations,
  activeId,
  isOpen,
  onSelect,
  onDelete,
  onNew,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-ink/20 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-dvh w-64 bg-paper border-r border-bamboo z-30 transform transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-0 lg:h-dvh`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-bamboo">
            <h2 className="text-sm font-medium text-pencil">历史对话</h2>
            <button
              onClick={onClose}
              className="lg:hidden text-pencil hover:text-ink cursor-pointer text-lg"
            >
              ✕
            </button>
          </div>

          {/* New chat button */}
          <div className="px-3 py-3">
            <button
              onClick={onNew}
              className="w-full text-left px-3 py-2 rounded-lg border border-bamboo text-sm text-pencil hover:text-ink hover:bg-paper-warm cursor-pointer transition-colors"
            >
              + 新对话
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {conversations.length === 0 ? (
              <p className="text-xs text-pencil/50 text-center mt-8">暂无历史对话</p>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group flex items-center rounded-lg cursor-pointer transition-colors ${
                      activeId === conv.id
                        ? "bg-paper-deep"
                        : "hover:bg-paper-warm"
                    }`}
                  >
                    <button
                      onClick={() => onSelect(conv.id)}
                      className="flex-1 text-left px-3 py-2.5 text-sm text-ink truncate"
                    >
                      {conv.title || "新对话"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(conv.id);
                      }}
                      className="shrink-0 px-2 py-2.5 text-pencil/40 hover:text-error opacity-0 group-hover:opacity-100 cursor-pointer transition-all text-xs"
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-bamboo">
            <p className="text-xs text-pencil/40">
              {conversations.length} 个会话
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

import { Conversation, ChatMessage } from "./types";
import { STORAGE_KEY } from "./constants";

interface Store {
  conversations: Conversation[];
  activeId: string | null;
}

function readStore(): Store {
  if (typeof window === "undefined") return { conversations: [], activeId: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { conversations: [], activeId: null };
    return JSON.parse(raw);
  } catch {
    return { conversations: [], activeId: null };
  }
}

function writeStore(store: Store): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage full
  }
}

export function loadConversations(): Conversation[] {
  return readStore().conversations;
}

export function loadActiveId(): string | null {
  return readStore().activeId;
}

export function loadActiveConversation(): Conversation | null {
  const { conversations, activeId } = readStore();
  if (!activeId) return null;
  return conversations.find((c) => c.id === activeId) ?? null;
}

export function saveConversation(conversation: Conversation): void {
  const store = readStore();
  const idx = store.conversations.findIndex((c) => c.id === conversation.id);
  if (idx >= 0) {
    store.conversations[idx] = conversation;
  } else {
    store.conversations.unshift(conversation);
  }
  store.activeId = conversation.id;
  writeStore(store);
}

export function setActiveConversation(id: string): void {
  const store = readStore();
  store.activeId = id;
  writeStore(store);
}

export function createConversation(title: string): Conversation {
  const conv: Conversation = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    title: title.slice(0, 30),
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const store = readStore();
  store.conversations.unshift(conv);
  store.activeId = conv.id;
  writeStore(store);
  return conv;
}

export function updateConversationMessages(
  id: string,
  messages: ChatMessage[],
  title?: string
): void {
  const store = readStore();
  const idx = store.conversations.findIndex((c) => c.id === id);
  if (idx < 0) return;
  store.conversations[idx].messages = messages;
  store.conversations[idx].updatedAt = Date.now();
  if (title) store.conversations[idx].title = title.slice(0, 30);
  writeStore(store);
}

export function deleteConversation(id: string): void {
  const store = readStore();
  store.conversations = store.conversations.filter((c) => c.id !== id);
  if (store.activeId === id) {
    store.activeId = store.conversations[0]?.id ?? null;
  }
  writeStore(store);
}

export function clearCurrentConversation(): void {
  const store = readStore();
  store.activeId = null;
  writeStore(store);
}

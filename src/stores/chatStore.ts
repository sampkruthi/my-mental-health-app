// src/stores/chatStore.ts
import { create } from "zustand";
import { Citation } from "../api/types";

export type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
  citations?: Citation[] | null;
};

interface ChatState {
  messages: Message[];
  addMessage: (msg: Message) => void;
  setMessages: (messages: Message[]) => void;
  prependMessages: (messages: Message[]) => void; 
  clear: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (msg) =>
    set((state: ChatState) => {
      // Deduplicate: if a message with the same sender, text, and similar timestamp
      // already exists (e.g., local user message vs DB-returned version), replace it
      // with the newer version (which has the real DB id).
      const isDuplicate = state.messages.some((m) => {
        if (m.id === msg.id) return true;
        // Same sender + same text + timestamps within 30 seconds = duplicate
        if (m.sender === msg.sender && m.text === msg.text) {
          const timeDiff = Math.abs(
            new Date(m.timestamp).getTime() - new Date(msg.timestamp).getTime()
          );
          return timeDiff < 30000;
        }
        return false;
      });

      if (isDuplicate) {
        // Replace the existing message with the new one (preserves DB id)
        return {
          messages: state.messages.map((m) => {
            if (m.sender === msg.sender && m.text === msg.text) {
              const timeDiff = Math.abs(
                new Date(m.timestamp).getTime() - new Date(msg.timestamp).getTime()
              );
              if (timeDiff < 30000) return msg;
            }
            return m;
          }),
        };
      }

      return { messages: [...state.messages, msg] };
    }),
  clear: () => set({ messages: [] }),
  setMessages: (messages) => 
    set({ messages }),
  prependMessages: (messages) =>
    set((state) => {
      const existingIds = new Set(state.messages.map((m) => m.id));
      // Also deduplicate by content — local messages have Date.now() ids
      // while DB messages have numeric ids, but the content is the same
      const existingContent = new Set(
        state.messages.map((m) => `${m.sender}:${m.text.slice(0, 50)}`)
      );
      const unique = messages.filter((m) => {
        if (existingIds.has(m.id)) return false;
        const contentKey = `${m.sender}:${m.text.slice(0, 50)}`;
        if (existingContent.has(contentKey)) return false;
        return true;
      });
      return { messages: [...unique, ...state.messages] };
    }),
}));
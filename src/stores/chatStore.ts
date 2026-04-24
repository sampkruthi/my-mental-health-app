// src/stores/chatStore.ts
import { create } from "zustand";
import { Citation } from "../api/types";
import { storage } from "../utils/storage";
import { persist, createJSONStorage } from "zustand/middleware";

export type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
  citations?: Citation[] | null;
};

interface ChatState {
  messages: Message[];
  addMessage: (msg: Message, localId?: string) => void;
  setMessages: (messages: Message[]) => void;
  prependMessages: (messages: Message[]) => void; 
  clear: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  // Updated addMessage to handle "Updating" a temporary message
  addMessage: (msg, localId?: string) =>
    set((state) => {
      // If we provided a localId, find that message and replace it with the server version
      if (localId) {
        const found = state.messages.some((m) => m.id === localId);
        if (found) {
          return {
            messages: state.messages.map((m) => (m.id === localId ? msg : m)),
          };
        }
      }

      // Standard deduplication by ID
      const exists = state.messages.some((m) => m.id === msg.id);
      if (exists) {
        return {
          messages: state.messages.map((m) => (m.id === msg.id ? msg : m)),
        };
      }
      
      // Append new message to the end of the array (preserving chronological order)
      return { messages: [...state.messages, msg] };
    }),

  setMessages: (messages) => set({ messages }),
  clear: () => set({ messages: [] }),

/*
export const useChatStore = create()(
  persist(
    (set, get) => ({
      messages: [],
      lastDisclaimerDate: null,
      
      // Fix for User A: Persist disclaimer status
      setDisclaimerAccepted: () => set({ lastDisclaimerDate: new Date().toISOString() }),
    addMessage: (msg) => set((state: ChatState) => {
*/
      //Replacing the duplication logic to delete duplicates on exact ID match
      /*
      // Content-based deduplication was causing messages to disappear when
      // users sent similar short messages ("ok", "yes", "thanks") or when
      // the bot gave similar greetings.
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

    */

  prependMessages: (messages) =>
    set((state) => {
      const existingIds = new Set(state.messages.map((m) => m.id));
      // Also deduplicate by content — local messages have Date.now() ids
      // while DB messages have numeric ids, but the content is the same
      
      
      /*const existingContent = new Set(
      //  state.messages.map((m) => `${m.sender}:${m.text.slice(0, 50)}`)
      //);
      const unique = messages.filter((m) => {
        if (existingIds.has(m.id)) return false;
        const contentKey = `${m.sender}:${m.text.slice(0, 50)}`;
        if (existingContent.has(contentKey)) return false;
        return true;
      });
      return { messages: [...unique, ...state.messages] };
    }), */
    const unique = messages.filter((m) => !existingIds.has(m.id));
      return { messages: [...unique, ...state.messages] };
    }),
    }));

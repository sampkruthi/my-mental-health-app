import create from 'zustand';
export type Message = {
id: string;
text: string;
sender: 'user' | 'ai';
timestamp: string;
};
interface ChatState {
messages: Message[];
addMessage: (msg: Message) => void;
clear: () => void;
}
export const useChatStore = create<ChatState>((set) => ({messages: [],
addMessage: (msg) =>
set((state) => ({ messages: [...state.messages, msg] })),
clear: () => set({ messages: [] }),
}));
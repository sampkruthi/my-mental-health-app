import { create } from 'zustand';

interface JournalState {
  draft: string;
  setDraft: (text: string) => void;
  clearDraft: () => void;
}

export const useJournalStore = create<JournalState>((set) => ({
  draft: '',
  setDraft: (text) => set({ draft: text }),
  clearDraft: () => set({ draft: "" }),
}));

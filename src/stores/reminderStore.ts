import { create } from 'zustand';

export type Reminder = {
  id: string;
  type: string;
  time: string;
  message: string;
  enabled: boolean;
};

interface ReminderState {
  list: Reminder[];
  setList: (items: Reminder[]) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
}

export const useReminderStore = create<ReminderState>((set) => ({
  list: [],
  setList: (items) => set({ list: items }),
  toggle: (id) =>
    set((state) => ({
      list: state.list.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      ),
    })),
  remove: (id) =>
    set((state) => ({ list: state.list.filter((r) => r.id !== id) })),
}));

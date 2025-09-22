import { create } from "zustand";
import { Reminder } from "../../services/mock_data/reminders";

interface ReminderState {
  list: Reminder[];
  setList: (items: Reminder[]) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
}

export const useReminderStore = create<ReminderState>((set) => ({
  list: [],
  setList: (items) => set({ list: items }),
  toggle: (id) => set(state => ({
    list: state.list.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
  })),
  remove: (id) => set(state => ({
    list: state.list.filter(r => r.id !== id)
  }))
}));

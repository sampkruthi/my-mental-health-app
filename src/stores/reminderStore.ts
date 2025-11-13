import { create } from "zustand";
import { Reminder1 as Reminder } from "../api/types";

interface ReminderState {
  list: Reminder[];
  setList: (items: Reminder[]) => void;
  toggle: (id: string) => void; // Keep as string for compatibility
  remove: (id: string) => void;
}

export const useReminderStore = create<ReminderState>((set) => ({
  list: [],
  setList: (items) => set({ list: items }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toggle: (id) => set(state => ({
    // Toggle functionality disabled - 'enabled' field doesn't exist in OpenAPI schema
    list: state.list // No-op for now
  })),
  remove: (id) => set(state => ({
    list: state.list.filter(r => r.id.toString() !== id)
  }))
}));

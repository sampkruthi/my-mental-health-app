import { create } from "zustand";

interface MoodState {
  current: number | null;
  setCurrent: (score: number | null) => void;
}

export const useMoodStore = create<MoodState>((set) => ({
  current: null,
  setCurrent: (score) => set({ current: score }),
}));

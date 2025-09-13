import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ResourceType = 'article' | 'audio' | 'video';

export interface ResourceItem {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  tags?: string[];
  snippet?: string;
  thumbnail?: string;
  createdAt?: string;
  read?: boolean;
}

export interface ResourceFilter {
  query?: string;
  tags?: string[];
  type?: ResourceType | 'all';
}

interface ResourcesState {
  list: ResourceItem[];
  favorites: string[];
  lastViewed?: string | null;
  filter: ResourceFilter;

  setList: (items: ResourceItem[]) => void;
  append: (items: ResourceItem[]) => void;
  setFilter: (filter: Partial<ResourceFilter>) => void;
  clearFilter: () => void;

  select: (id: string) => void;
  markRead: (id: string, read?: boolean) => void;

  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;

  clear: () => void;
}

// ✅ Persisted slice type
type PersistedResourcesState = Pick<ResourcesState, 'favorites' | 'lastViewed' | 'filter'>;

// ✅ Correctly typed store
export const useResourcesStore = create<ResourcesState>()(
  persist(
    (set, get) => ({
      list: [],
      favorites: [],
      lastViewed: null,
      filter: { type: 'all' },

      setList: (items) => set({ list: items }),
      append: (items) => set({ list: [...get().list, ...items] }),
      setFilter: (filter) => set({ filter: { ...get().filter, ...filter } }),
      clearFilter: () => set({ filter: { type: 'all' } }),
      select: (id) => set({ lastViewed: id }),
      markRead: (id, read = true) =>
        set({ list: get().list.map((r) => (r.id === id ? { ...r, read } : r)) }),
      addFavorite: (id) =>
        set({ favorites: get().favorites.includes(id) ? get().favorites : [...get().favorites, id] }),
      removeFavorite: (id) => set({ favorites: get().favorites.filter((f) => f !== id) }),
      clear: () => set({ list: [], favorites: [], lastViewed: null }),
    }),
    {
      name: 'resources-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        lastViewed: state.lastViewed,
        filter: state.filter,
      }) as PersistedResourcesState,
      version: 1,
    }
  )
);

// src/utils/storage.ts
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Unified storage utility that works across web and native platforms
 * Uses SecureStore for mobile, localStorage for web
 */

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER_ID: 'user_id',
} as const;

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.clear();
      } else {
        // Clear known keys on mobile
        await Promise.all([
          SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN).catch(() => {}),
          SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID).catch(() => {}),
        ]);
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};

export { STORAGE_KEYS };
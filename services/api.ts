// src/services/api.ts
import axios from "axios";
import { mockApiService } from "./mockApi";
import type { MoodTrendPoint, Reminder, ChatMessage } from "../src/api/types";

export interface LoginResponse {
  token: string;
}

export interface ApiService {
  login: (email: string, password: string) => Promise<LoginResponse>;
  getMoodCount: () => Promise<number>;         // real API
  getReminderCount: () => Promise<number>;     // real API
  getUserProfile: () => Promise<unknown>;      // real API

  // mock-only (optional)
  getMoodTrends?: () => Promise<MoodTrendPoint[]>;
  getReminders?: () => Promise<Reminder[]>;

  // ✅ chat mock-only (optional)
  getChatHistory?: () => Promise<ChatMessage[]>;
  sendChatMessage?: (text: string) => Promise<ChatMessage>;
}


// Step 2: Global service flag
let apiService: ApiService | null = null;

export const setApiService = (service: ApiService) => {
  apiService = service;
};

export const getApiService = (): ApiService => {
  if (!apiService) {
    throw new Error("API service not initialized. Call setApiService in App.tsx");
  }
  return apiService;
};

// Step 3: Real API
const API_BASE_URL = __DEV__
  ? "http://localhost:8000"
  : "https://your-api-domain.com";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const realApiService: ApiService = {
  async login(email, password) {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return data;
  },
  async getMoodCount() {
    const { data } = await apiClient.get("/moods/count");
    return data;
  },
  async getReminderCount() {
    const { data } = await apiClient.get("/reminders/count");
    return data;
  },
  async getUserProfile() {
    const { data } = await apiClient.get("/me");
    return data;
  },
};

// Step 4: Export mock too
export { mockApiService };

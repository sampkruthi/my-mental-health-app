// src/services/api.ts
import axios from "axios";
import { mockApiService } from "./mockApi";
import type { MoodTrendPoint, MoodLog, Reminder, ChatMessage, GuidedActivity,JournalEntry, JournalInsights, ResourceRec } from "../src/api/types";

export interface LoginResponse {
  token: string;
}

export interface ApiService {
  login: (email: string, password: string) => Promise<LoginResponse>;
  getMoodCount: () => Promise<number>;
  getReminderCount: () => Promise<number>;
  getUserProfile: () => Promise<unknown>;

  // mock-only or optional
  getMoodTrends?: () => Promise<MoodTrendPoint[]>;
  getMoodHistory?: () => Promise<MoodLog[]>;
  logMood?: (input: { score: number; note?: string }) => Promise<MoodLog>;
  getReminders?: () => Promise<Reminder[]>;
  getChatHistory?: () => Promise<ChatMessage[]>;
  sendChatMessage?: (text: string) => Promise<ChatMessage>;
  // ✅ Guided Activities
  getActivities?: () => Promise<GuidedActivity[]>;
  logActivity?: (id: string) => Promise<{ id: string; completedAt: string }>;

  getJournalInsights(): Promise<JournalInsights>;
  logJournal(input: { content: string }): Promise<JournalEntry>;
  getJournalHistory(): Promise<JournalEntry[]>


    // ---------- Resources ----------
  getContentRecommendations(params?: { q?: string; tags?: string[]; limit?: number }): Promise<ResourceRec[]>;

}

// Step 2: Global service
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

  // Real endpoints if your backend has them
  async getMoodHistory() {
    const { data } = await apiClient.get<MoodLog[]>("/moods/history");
    return data;
  },
  async logMood(input: { score: number; note?: string }) {
    const { data } = await apiClient.post<MoodLog>("/moods/log", input);
    return data;
  },

  //Guided activity

  

  // ✅ Get activities
  async getActivities() {
    const { data } = await apiClient.get("/activities");
    return data; // must match GuidedActivity[]
  },

  // ✅ Log completion
  async logActivity(id: string) {
    const { data } = await apiClient.post("/activities/log", { id });
    return data; // e.g. { id: string, completedAt: string }
  },


  // ---------- Journaling ----------
async getJournalInsights() {
  const { data } = await apiClient.get<JournalInsights>("/journal/insights");
  return data;
},

async logJournal(input: { content: string }) {
  const { data } = await apiClient.post<JournalEntry>("/journal/log", input);
  return data;
},
async getJournalHistory() {
  const { data } = await apiClient.get<JournalEntry[]>("/journal/history");
  return data;
},
// ---------- Resources ----------
async getContentRecommendations(params?: { q?: string; tags?: string[]; limit?: number }) {
  const { data } = await apiClient.get<ResourceRec[]>("/recommend/content", { params });
  return data;
},


  
};

// Step 4: Export mock too
export { mockApiService };

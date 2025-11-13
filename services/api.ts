// src/services/api.ts
import axios from "axios";
import { mockApiService } from "./mockApi";
import type { MoodTrendPoint, MoodLog, Reminder, ChatMessage, GuidedActivity,JournalEntry, JournalInsights, ResourceRec, Token, Reminder1 } from "../src/api/types";
import { Platform } from "react-native";
import * as SecureStore from 'expo-secure-store';

export interface LoginResponse {
  token: string;
}

export interface ApiService {
  login: (email: string, password: string) => Promise<LoginResponse>;

// add register
  register(name: string, email: string, password: string): Promise<Token>;

  getMoodCount: () => Promise<number>;
  getReminderCount: () => Promise<number>;
  //getUserProfile: () => Promise<unknown>;

  // mock-only or optional
  getMoodTrends?: () => Promise<MoodTrendPoint[]>;
  getMoodHistory?: () => Promise<MoodLog[]>;
  logMood?: (input: { score: number; note?: string }) => Promise<MoodLog>;
  getReminders?: () => Promise<Reminder[]>;
  getChatHistory?: () => Promise<ChatMessage[]>;
  sendChatMessage?: (text: string) => Promise<ChatMessage>;
  // Guided Activities
  getActivities?: () => Promise<GuidedActivity[]>;
  logActivity?: (id: string) => Promise<{ id: string; completedAt: string }>;

  getJournalInsights(): Promise<JournalInsights>;
  logJournal(input: { content: string }): Promise<JournalEntry>;
  getJournalHistory(): Promise<JournalEntry[]>


    // Reminders
  getReminders1(): Promise<Reminder1[]>;
  addReminder(reminder: { type: string; hour: number; minute: number; message: string }): Promise<Reminder1>;
  //toggleReminder(id: string): Promise<Reminder1>;
  deleteReminder(id: string): Promise<{ success: boolean }>;


    // ---------- Resources ----------
  getContentRecommendations(params?: { q?: string; tags?: string[]; limit?: number }): Promise<ResourceRec[]>;

  //add logout function
  logout(): Promise<void>;
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

//NK adding this logic
const getApiBaseUrl = () => {
  // Hardcoded for debugging - we'll make it conditional later
  if (__DEV__) {
    // Development environment
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000'; // Android emulator
    }
    return 'http://127.0.0.1:8000'; // iOS simulator, web, or physical device on same network
  }
  return 'https://your-production-api.com'; // Production
};

/*
const API_BASE_URL = getApiBaseUrl();
console.log('🔍 API Base URL:', getApiBaseUrl());
  const url = 'http://127.0.0.1:8000';
  console.log('🔍 API Base URL:', url);
  return url; */

  /* Simplifying for now to test integration problems
  if (__DEV__) {
   
    /* Simplifying for now to test integration problems
    // Development environment
    if (Platform.OS === 'android') {
      //return 'http://10.0.2.2:8000'; // Android emulator
      return "https://192.168.86.27:8000";
    }
    //return 'http://127.0.0.1:8000'; // iOS simulator, web, or physical device on same network
    return "https://192.168.86.27:8000";
  }
  return 'https://your-production-api.com'; // Production
  */


const API_BASE_URL = getApiBaseUrl();
console.log('🔍 API Base URL:', getApiBaseUrl());

// Step 3: Real API
/*
const API_BASE_URL = __DEV__
  ? "http://localhost:8000"
  : "https://your-api-domain.com";
*/
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json', //adding this to headers NK
  },
  // For development with self-signed certificates
  /* Simplifying for now to test integration problems
  ...__DEV__ && {
    httpsAgent: undefined, // Let React Native handle HTTPS
  } */
});

//NK adding auth, login, register etc

const getToken = async () => {
  try {
    // For web platform, SecureStore might not be available
    if (Platform.OS === 'web') {
      return localStorage.getItem('auth_token');
    }
    return await SecureStore.getItemAsync('auth_token');
  } catch (error) {
    console.log('Error getting token:', error);
    return null;
  }
};

const setToken = async (token: string) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem('auth_token', token);
      return;
    }
    await SecureStore.setItemAsync('auth_token', token);
  } catch (error) {
    console.log('Error storing token:', error);
  }
};

// User ID management - NEW ADDITION
const setUserId = async (userId: string) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem('user_id', userId);
      return;
    }
    await SecureStore.setItemAsync('user_id', userId);
  } catch (error) {
    console.log('Error storing user ID:', error);
  }
};

const getUserId = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem('user_id');
    }
    return await SecureStore.getItemAsync('user_id');
  } catch (error) {
    console.log('Error getting user ID:', error);
    return null;
  }
};

const getCurrentUserId = async (): Promise<string> => {
  const userId = await getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return userId;
};

const clearUserSession = async () => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
      return;
    }
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_id');
  } catch (error) {
    console.log('Error clearing session:', error);
  }
};

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('🔥 API Error:', error.message);
    console.log('🔥 API Error Config:', error.config?.url);
    console.log('🔥 API Error Response:', error.response?.status, error.response?.data);

    if (error.response?.status === 401) {
      // Token expired or invalid
      await clearUserSession();
      // Redirect to login or refresh token
    }
    return Promise.reject(error);
  }
);




export const realApiService: ApiService = {

  async login(username, password) {
    console.log('🔍 RealAPI called for this login attempt:', { username });
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const { data } = await apiClient.post("/api/auth/token", formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
     });
     if (data.access_token) {
      await setToken(data.access_token);
      await setUserId(username);
    }
    return {token: data.access_token};
  },

  async register(name: string, email: string, password: string) {
    console.log('🔍 RealAPI called for registration:', { name, email });
    const { data } = await apiClient.post("/api/auth/register", {
      username: email,
      password: password,
      // Add name if your backend expects it
      name: name
    });
    console.log('🔍 Registration response:', data);

    // Store both token and user ID
    if (data.access_token) {
      await setToken(data.access_token);
      await setUserId(email); // Store email as user_id (email is used as username)
    }

    return data;
  },

  async logout() {
    await clearUserSession();
  },

  async getMoodCount() {
    const { data } = await apiClient.get("/mood/trends");
    return data;
  },
  async getReminderCount() {
    const { data } = await apiClient.get("/reminders/count");
    return data;
  },
  /*async getUserProfile() {
    const { data } = await apiClient.get("/me");
    return data;
  }, */

  // Real endpoints if your backend has them
  async getMoodHistory() {
    // Updated to match OpenAPI - no user_id needed, extracted from JWT
    //NK adding userId extraction 10/31/2025
    const userId = await getCurrentUserId();
    const { data } = await apiClient.get<MoodLog[]>("/api/mood/history", {
      params: { user_id: userId,days: 30 }
    });
    return data;
  },

  async logMood(input: { score: number; note?: string }) {
    // Updated to match OpenAPI MoodRequest schema - no user_id needed
    //NK adding userId extraction 10/31/2025
    const userId = await getCurrentUserId();
    const { data } = await apiClient.post<MoodLog>("/api/mood/log",
      {
        user_id: userId,
        mood_score: input.score,
        note: input.note || null
      }
    );
    return data;
  },
  // Updated chat endpoint to match OpenAPI
  async sendChatMessage(text: string) {
    const userId = await getCurrentUserId();
    const { data } = await apiClient.post("/api/chat/chat", {
      user_id: userId,
      message: text
    });
    
    // Convert to your expected format
    return {
      id: Date.now().toString(),
      text: data.response,
      sender: "ai" as const,
      timestamp: new Date().toISOString()
    } as ChatMessage;
  },

  //Guided activity

  

  //  Get activities
  async getActivities() {
    const { data } = await apiClient.get("/api/activities/suggest");
    return data; // must match GuidedActivity[]
  },

  /*
  // Log completion
  async logActivity(id: string) {
    const { data } = await apiClient.post("/activities/log", { id });
    return data; // e.g. { id: string, completedAt: string }
  },
*/

  // ---------- Journaling ----------
async getJournalInsights() {
  const { data } = await apiClient.get<JournalInsights>("/api/journal/insights");
  return data;
},

async logJournal(input: { content: string }) {
  const { data } = await apiClient.post<JournalEntry>("/api/journal/log", 
    {content: input.content}
  );
  return data;
},
async getJournalHistory() {
  const { data } = await apiClient.get<JournalEntry[]>("/api/journal/history");
  return data;
},
// ---------- Resources ----------
async getContentRecommendations(params?: { q?: string; tags?: string[]; limit?: number }) {
  const { data } = await apiClient.get<ResourceRec[]>("/api/recommend/content", { 
    params: { k: params?.limit || 5}
   });
   console.log('🔍 Content recommendations response:', data); // DEBUG

  return data;
},



// --- Get all reminders ---
  async getReminders1() {
    const { data } = await apiClient.get("/api/reminders");
    return data; // Reminder[]
  },

  // --- Add reminder ---
  async addReminder(reminder: { type: string; hour: number; minute: number; message: string }) {
    // Parse time string to hour/minute
    //const [hour, minute] = reminder.time.split(':').map(Number);
    
    const { data } = await apiClient.post("/api/reminders/", {
      type: reminder.type,
      hour: reminder.hour,
      minute: reminder.minute,
      message: reminder.message
    });
    console.log('🔵 API Service - addReminder response:', data); 
    return data;

    //const { data } = await apiClient.post("/reminders", reminder);
    //return data; // Reminder

},

//I don't have a toggle endpoint 
/*
  // --- Toggle reminder ---
  async toggleReminder(id: string) {
    const { data } = await apiClient.patch(`/reminders/${id}/toggle`);
    return data; // Reminder
  },
*/
  // --- Delete reminder ---
  async deleteReminder(id: string) {
    const { data } = await apiClient.delete(`/api/reminders/${parseInt(id)}`);
    return data; // { success: boolean }
  },


  
};

// Step 4: Export mock too
export { mockApiService };

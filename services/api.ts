// src/services/api.ts
import axios from "axios";
import { mockApiService } from "./mockApi";
import type { MoodTrendPoint, MoodLog, Reminder, ChatMessage, GuidedActivity,JournalEntry, JournalInsights, ResourceRec, 
  Token, Reminder1, MemorySummary, ProgressDashboard, 
  ResourceRecRAG} from "../src/api/types";
import { Platform } from "react-native";
import {storage, STORAGE_KEYS} from "../src/utils/storage";
import * as SecureStore from 'expo-secure-store';

export interface LoginResponse {
  token: string;
  userId?: string;
}

export interface ApiService {
  login: (email: string, password: string) => Promise<LoginResponse>;

// add register
  register(name: string, email: string, password: string): Promise<Token & { userId?: string }>;

  //getMoodCount: () => Promise<MoodLog[]>;
  //getReminderCount: () => Promise<number>; invalid
  //getUserProfile: () => Promise<unknown>;

  // mock-only or optional
  getMoodTrends?: () => Promise<MoodTrendPoint[]>;
  getMoodHistory?: () => Promise<MoodLog[]>;
  logMood?: (input: { score: number; note?: string }) => Promise<MoodLog>;
  getReminders?: () => Promise<Reminder[]>;
  //getChatHistory?: () => Promise<ChatMessage[]>;
  getChatHistory?: (limit?: number, offset?: number) => Promise<{
    messages: ChatMessage[];
    total_count: number;
    has_more: boolean;
  }>;
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
  getMemorySummary(): Promise<MemorySummary>;
  getProgressDashboard?(): Promise<ProgressDashboard>;
  getContentRecommendationsRag(params?: { limit?: number }): Promise<ResourceRecRAG>;


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


//Adding these 3 methods for unified SecureStore implementation 11/14
// Helper functions for token and userId (read from unified storage)
const getStoredToken = async (): Promise<string | null> => {
  return await storage.getItem(STORAGE_KEYS.TOKEN);
};

const getStoredUserId = async (): Promise<string | null> => {
  return await storage.getItem(STORAGE_KEYS.USER_ID);
};

const getCurrentUserId = async (): Promise<string> => {
  const userId = await getStoredUserId();
  if (!userId) {
    throw new Error('User not authenticated - no user ID found');
  }
  return userId;
};
//end of adding 11/14



//NK adding this logic
// Environment configuration
const APP_ENV = __DEV__ ? 'development' : 'beta'; // Change to 'beta' for beta testing

const getApiBaseUrl = () => {
  console.log('🔧 Current Environment:', APP_ENV);

  if (APP_ENV === 'development') {
    // Local development
    if (Platform.OS === 'android') {
      const url = 'http://192.168.86.25:8000'; // Local machine for Android
      console.log('🌐 Android Dev API URL:', url);
      return url;
    }
    return 'http://127.0.0.1:8000'; // iOS simulator, web, or local machine
  } 
  /*
  else if (APP_ENV === 'beta') {
    // Beta testing - same as production for now
    // Can be changed to a separate beta server if needed
    return 'https://mental-health-assistant-app-production.up.railway.app';
  } */ else {
    // Production
    return 'https://mental-health-assistant-app-production.up.railway.app';
  }
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


//const API_BASE_URL = getApiBaseUrl();
//console.log('🔍 API Base URL:', getApiBaseUrl());
const API_BASE_URL = 'https://mental-health-assistant-app-production.up.railway.app';
console.log('Using API URL:', API_BASE_URL);

// Step 3: Real API
/*
const API_BASE_URL = __DEV__
  ? "http://localhost:8000"
  : "https://your-api-domain.com";
*/
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json', //adding this to headers NK
  },

  // For development with self-signed certificates
  /* Simplifying for now to test integration problems
  ...__DEV__ && {
    httpsAgent: undefined, // Let React Native handle HTTPS
  } */
});
console.log('🌐 Axios baseURL:', apiClient.defaults.baseURL);


// Adding these for unified SecureStore implementation 11/14

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      console.log('Request interceptor started');
    const token = await getStoredToken();
    console.log('🔑 Token retrieved:', token ? 'exists' : 'null');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request interceptor complete');
    console.log('Making request:', {
      method: config.method,
      baseURL: config.baseURL,
      url: config.url,
      fullURL: `${config.baseURL}${config.url}`
    });

    return config;
  } catch(error) 
  {
    console.error('Request interceptor error, continuing anyway', error);
    return config;
  }
  },
  (error) => {
    console.error('request interceptor rejected', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response?.data?.detail) {
      error.message = error.response.data.detail;
    }

    if (error.response?.status === 401) {
      console.warn('401 Unauthorized - Token may be expired');
      // Don't clear storage here - let AuthContext handle it
      // Just reject so the app can handle it appropriately
    }
    
    
    return Promise.reject(error);
  }
);

//ending of adding for unified SecureStore 11/14

/* Commenting this out to check for unified SecureStore implementation 11/14

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


Commented this section out for unified SecureStore implemnetaiton trial*/

export const realApiService: ApiService = {

  async login(username: string, password: string): Promise<LoginResponse> {
    console.log('Login attempt:', { username });
    
    const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  const { data } = await apiClient.post("/api/auth/token", params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  console.log(' Login successful, user id is', username);
  
  return {
    token: data.access_token,
    userId: username,
  };
    /* Commenting FormData due to issues with logging in in Android
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const { data } = await apiClient.post("/api/auth/token", formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('✅ Login successful');
    
    // Return token and userId to be handled by AuthContext
    return {
      token: data.access_token,
      userId: username, // Using username as userId (adjust if your API returns a different ID)
    }; 

    Commenting FormData due to issues with logging in in Android*/
  },

  async register(name: string, email: string, password: string): Promise<Token & { userId?: string }> {
    console.log('Registration attempt:', { name, email });
    
    const { data } = await apiClient.post("/api/auth/register", {
      username: email,
      password: password,
      name: name,
    });

    console.log('Registration successful');
    console.log('Response from', API_BASE_URL);
    
    // Return token and userId to be handled by AuthContext
    return {
      ...data,
      userId: email, // Using email as userId
    };
  },

  async logout(): Promise<void> {
    console.log('Logout from API service');
    // Just a placeholder - actual logout is handled by AuthContext
    // You could add a server-side logout call here if needed
  },


  /* testing for Unified Secure Store 11/14
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

  Unified SecureStore 11/14 */

  /* commenting for now
  async getMoodCount() {
    const { data } = await apiClient.get("/api/mood/history");
    return data;
  }, */
  /* invalid
  async getReminderCount() {
    const { data } = await apiClient.get("/reminders/count");
    return data;
  }, */
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

  //Chat history

  async getChatHistory(limit: number = 20, offset: number = 0) {
    const { data } = await apiClient.get("/api/chat/history", {
      params: { limit, offset }
    });
    
    return {
      messages: data.messages,
      total_count: data.total_count,
      has_more: data.has_more
    };
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

// --- Get RAG recommendations ---
async getContentRecommendationsRag(params?: { limit?: number }) {
  const { data } = await apiClient.get<ResourceRecRAG>("/api/recommend/rag", {
    params: { limit: params?.limit || 10 }
  });
  console.log('🔍 RAG Content recommendations response:', data); // DEBUG
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

  // --- Get memory summary ---
  async getMemorySummary() {
    console.log('🔍 RealAPI called for memory summary');
    const { data } = await apiClient.get<MemorySummary>("/api/memory/summary");
    console.log('🔍 Memory summary response:', data);
    return data;
  },

  async getProgressDashboard() {
    const { data } = await apiClient.get<ProgressDashboard>("/api/progress/dashboard");
    return data;
  },


};

// Step 4: Export mock too
export { mockApiService };

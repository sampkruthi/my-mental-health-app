// src/services/api.ts
import axios from "axios";
import { mockApiService } from "./mockApi";

// Flag to switch
let apiService: any = null;

export const setApiService = (service: any) => {
  apiService = service;
};

export const getApiService = () => {
  if (!apiService) {
    throw new Error("API service not initialized. Call setApiService in App.tsx");
  }
  return apiService;
};

// Example real API (expand as needed)
const API_BASE_URL = __DEV__ ? "http://localhost:8000" : "https://your-api-domain.com";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const realApiService = {
  async login(email: string, password: string) {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return data;
  },
  // other endpoints can go here
};

// Export mock so App.tsx can choose
export { mockApiService };

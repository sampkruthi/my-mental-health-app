// src/api/apiClient.ts
import { Platform } from "react-native";
import axios, { AxiosRequestConfig } from "axios";

const BASE_URL = "https://dummy.api/api";

const realClient = axios.create({ baseURL: BASE_URL });

export async function apiRequest<T = any>(
  method: "get" | "post" | "put" | "delete",
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  // For web, you can let MSW handle requests
  if (Platform.OS === "web") {
    const response = await realClient.request<T>({ method, url, data, ...config });
    return response.data;
  }

  // For mobile, simulate responses
  await new Promise((r) => setTimeout(r, 300)); // simulate latency

  // Fake responses
  if (url.endsWith("/auth/login")) {
    if (data.email === "test@test.com" && data.password === "1234") {
      return { token: "fake-jwt-token-123" } as T;
    } else {
      throw new Error("Invalid credentials");
    }
  }

  if (url.endsWith("/mood/trends")) {
    return [{ avg: 3 }, { avg: 4 }, { avg: 5 }, { avg: null }] as any;
  }

  if (url.endsWith("/reminders")) {
    return [{ id: 1, title: "Doctor Appointment" }, { id: 2, title: "Meditation" }] as any;
  }

  // Default empty
  return {} as T;
}

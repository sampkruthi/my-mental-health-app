// src/services/mockApi.ts
import type { MoodTrendPoint, Reminder } from "../src/api/types";

type LoginResult = { token: string };

// Simulate network delay
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ✅ Dummy data
const dummyMoodTrends: MoodTrendPoint[] = [
  { avg: 4, date: "2025-09-01" },
  { avg: 3, date: "2025-09-02" },
  { avg: 5, date: "2025-09-03" },
];

const dummyReminders: Reminder[] = [
  { id: 1, message: "Morning meditation", dueDate: "2025-09-08T09:00:00Z" },
  { id: 2, message: "Afternoon breathing", dueDate: "2025-09-08T14:30:00Z" },
];

// =====================
// Mock API service
// =====================
export const mockApiService = {
  // Login
  async login(email: string, password: string): Promise<LoginResult> {
    console.log("[mockApi] login attempt:", { email });
    await delay(500);

    if (email === "test@test.com" && password === "1234") {
      const token = "mock-jwt-token-123";
      console.log("[mockApi] login success, token:", token);
      return { token };
    }

    console.log("[mockApi] login failed");
    throw new Error("Invalid credentials");
  },

  // Fetch mood trends
  async getMoodTrends(): Promise<MoodTrendPoint[]> {
    console.log("[mockApi] fetching mood trends");
    await delay(300);
    console.log("[mockApi] mood trends returned:", dummyMoodTrends);
    return dummyMoodTrends;
  },

  // Fetch reminders
  async getReminders(): Promise<Reminder[]> {
    console.log("[mockApi] fetching reminders");
    await delay(300);
    console.log("[mockApi] reminders returned:", dummyReminders);
    return dummyReminders;
  },
};

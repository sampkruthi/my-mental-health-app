// src/services/mockApi.ts
import type { MoodTrendPoint, Reminder, ChatMessage } from "../src/api/types";

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

// ✅ Dummy chat history
const dummyChatHistory: ChatMessage[] = [
  { id: "1a", sender: "user", text: "Hey, I feel a bit stressed today.", timestamp: "2025-09-08T10:00:00Z" },
  { id: "2b", sender: "ai", text: "I understand. Want me to guide you through a quick breathing exercise?", timestamp: "2025-09-08T10:01:00Z" },
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

  async getMoodCount(): Promise<number> {
    console.log("[mockApi] getting mood count");
    await delay(200);
    return dummyMoodTrends.length;
  },

  // Fetch reminders
  async getReminders(): Promise<Reminder[]> {
    console.log("[mockApi] fetching reminders");
    await delay(300);
    console.log("[mockApi] reminders returned:", dummyReminders);
    return dummyReminders;
  },

   async getReminderCount(): Promise<number> {
    console.log("[mockApi] getting reminder count");
    await delay(200);
    return dummyReminders.length;
  },
  async getUserProfile(): Promise<{ name: string; email: string }> {
    console.log("[mockApi] getting user profile");
    await delay(200);
    return { name: "Test User", email: "test@test.com" };
  },

  // ✅ Fetch chat history
  async getChatHistory(): Promise<ChatMessage[]> {
    console.log("[mockApi] fetching chat history");
    await delay(300);
    console.log("[mockApi] chat history returned:", dummyChatHistory);
    return dummyChatHistory;
  },

  // ✅ Send chat message
  async sendChatMessage(text: string): Promise<ChatMessage> {
    console.log("[mockApi] sending message:", text);
    await delay(400);

    // Add user message to dummy history
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    };

    dummyChatHistory.push(userMessage);

    // Simulate bot reply
    const botReply: ChatMessage = {
      id: Date.now().toString() + 1,
      sender: "ai",
      text: "Thanks for sharing. Remember to take a deep breath 🌿",
      timestamp: new Date().toISOString(),
    };

    dummyChatHistory.push(botReply);

    console.log("[mockApi] bot reply:", botReply);
    return botReply;
  },
};

// src/services/mockApi.ts
import type { MoodTrendPoint, Reminder, ChatMessage, MoodLog, GuidedActivity } from "../src/api/types";

import BoxBreathingIcon from "../src/images/breathing.png";
import DiaphragmIcon from "../src/images/diaphragm.png";
import BodyScanIcon from "../src/images/bodyscan.png";
import StretchIcon from "../src/images/stretching.png";
import MusicIcon from "../src/images/music.png";
import CalmTrack from "../src/images/watermusic.mp3";

type LoginResult = { token: string };
const activityLogs: { id: string; completedAt: string }[] = [];

// Simulate network delay
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ✅ Dummy data
const dummyMoodTrends: MoodTrendPoint[] = [
  { avg: 4, date: "2025-09-01" },
  { avg: 3, date: "2025-09-02" },
  { avg: 5, date: "2025-09-03" },
];
const dummyMoodHistory: MoodLog[] = [
  { id: "1", score: 3, note: "Felt tired in the morning", timestamp: "2025-09-01T08:30:00Z" },
  { id: "2", score: 4, note: "Productive workday", timestamp: "2025-09-02T17:00:00Z" },
  { id: "3", score: 5, note: "Had dinner with friends", timestamp: "2025-09-03T20:15:00Z" },
  { id: "4", score: 2, note: "Stressful meetings", timestamp: "2025-09-04T11:45:00Z" },
  { id: "5", score: 4, note: "Evening walk was relaxing", timestamp: "2025-09-05T19:00:00Z" },
  { id: "6", score: 3, note: "Felt okay but low energy", timestamp: "2025-09-06T14:00:00Z" },
  { id: "7", score: 5, note: "Weekend family time ❤️", timestamp: "2025-09-07T21:30:00Z" },
  { id: "8", score: 4, note: "Started new book", timestamp: "2025-09-08T20:00:00Z" },
  { id: "9", score: 2, note: "Long work hours", timestamp: "2025-09-09T18:15:00Z" },
  { id: "10", score: 3, note: "Feeling neutral", timestamp: "2025-09-10T09:45:00Z" },
  { id: "11", score: 4, note: "Good workout session", timestamp: "2025-09-11T07:30:00Z" },
  { id: "12", score: 5, note: "Great mood today 🎉", timestamp: "2025-09-12T16:20:00Z" },
  { id: "13", score: 3, note: "Bit anxious but manageable", timestamp: "2025-09-13T13:10:00Z" },
  { id: "14", score: 4, note: "Relaxed Sunday", timestamp: "2025-09-14T19:40:00Z" },
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


//Dummy Guided Activity

const activities: GuidedActivity[] = [
  {
    id: "1",
    title: "5-Minute Box Breathing",
    type: "Breathing",
    description: "A simple technique to calm your mind and body.",
    thumbnail:  BoxBreathingIcon,
    steps: [
      "Sit comfortably and close your eyes.",
      "Inhale for 4 seconds.",
      "Hold your breath for 4 seconds.",
      "Exhale for 4 seconds.",
      "Repeat the cycle for 5 minutes."
    ]
  },
  {
    id: "2",
    title: "Daily Diaphragmatic Breathing",
    type: "Breathing",
    description: "Practice deep breathing to reduce tension.",
    thumbnail: DiaphragmIcon,
    steps: [
      "Sit or lie down comfortably.",
      "Place one hand on your chest and one on your belly.",
      "Inhale deeply through your nose, feeling your belly rise.",
      "Exhale slowly through your mouth.",
      "Repeat for 10 breaths."
    ]
  },
  {
    id: "3",
    title: "Body Scan Meditation",
    type: "Meditation",
    description: "Tune into sensations and relax your body.",
    thumbnail: BodyScanIcon,
    steps: [
      "Lie down comfortably.",
      "Close your eyes and focus on your breathing.",
      "Bring attention to your feet, then slowly move upward.",
      "Notice any tension and consciously relax.",
      "Continue until you reach your head."
    ]
  },
  {
    id: "4",
    title: "Stress Busting Stretch",
    type: "Stretching",
    description: "Relieve stress with simple stretches.",
    thumbnail: StretchIcon,
    steps: [
      "Stand with feet shoulder-width apart.",
      "Stretch arms overhead and hold for 10 seconds.",
      "Bend sideways to the left and right.",
      "Roll shoulders slowly backwards and forwards.",
      "Repeat twice."
    ]
  },
  {
    id: "5",
    title: "Listen to Calm Music",
    type: "Music",
    description: "Relax your mind with soft tunes.",
    thumbnail: MusicIcon,
    steps: ["Play the track and focus on the rhythm."],
    audioFile: CalmTrack,
    duration: 180 // 3 minutes
  }
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

  // ---------- Mood ----------
  async getMoodTrends(): Promise<MoodTrendPoint[]> {
    console.log("[mockApi] fetching mood trends");
    await delay(300);
    console.log("[mockApi] mood trends returned:", dummyMoodTrends);
    return dummyMoodTrends;
  },

  async getMoodHistory(): Promise<MoodLog[]> {
    console.log("[mockApi] fetching mood history");
    await delay(300);
    console.log("[mockApi] mood history returned:", dummyMoodHistory);
    return dummyMoodHistory;
  },

  async logMood(input: { score: number; note?: string }): Promise<MoodLog> {
    console.log("[mockApi] logging new mood:", input);
    await delay(400);

    const newMood: MoodLog = {
      id: Date.now().toString(),
      score: input.score,
      note: input.note,
      timestamp: new Date().toISOString(),
    };

    dummyMoodHistory.push(newMood);
    console.log("[mockApi] mood log saved:", newMood);
    return newMood;
  },

  async getMoodCount(): Promise<number> {
    console.log("[mockApi] getting mood count");
    await delay(200);
    return dummyMoodHistory.length;
  },

  // ---------- Reminders ----------
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

  // ---------- Chat ----------
  async getChatHistory(): Promise<ChatMessage[]> {
    console.log("[mockApi] fetching chat history");
    await delay(300);
    console.log("[mockApi] chat history returned:", dummyChatHistory);
    return dummyChatHistory;
  },

  async sendChatMessage(text: string): Promise<ChatMessage> {
    console.log("[mockApi] sending message:", text);
    await delay(400);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    };

    dummyChatHistory.push(userMessage);

    const botReply: ChatMessage = {
      id: Date.now().toString() + "r",
      sender: "ai",
      text: "Thanks for sharing. Remember to take a deep breath 🌿",
      timestamp: new Date().toISOString(),
    };

    dummyChatHistory.push(botReply);

    console.log("[mockApi] bot reply:", botReply);
    return botReply;
  },


  //---------Guided Activity----------//

  


  // ✅ Get activities
  async getActivities(): Promise<GuidedActivity[]> {
    console.log("[mockApi] fetching guided activities");
    await delay(300);
    return activities;
  },

  // ✅ Log completion
  async logActivity(id: string): Promise<{ id: string; completedAt: string }> {
    console.log("[mockApi] logging completion for activity:", id);
    await delay(200);

    const log = { id, completedAt: new Date().toISOString() };
    activityLogs.push(log);

    console.log("[mockApi] activity logged:", log);
    return log;
  },
};









// src/services/mockApi.ts
import type { MoodTrendPoint, Reminder, ChatMessage, MoodLog, GuidedActivity, JournalEntry, JournalInsights, ResourceRec,
   Token, Reminder1, MemorySummary} from "../src/api/types";

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
  { mood_score: 3, note: "Felt tired in the morning", timestamp: "2025-09-01T08:30:00Z" },
  { mood_score: 4, note: "Productive workday", timestamp: "2025-09-02T17:00:00Z" },
  { mood_score: 5, note: "Had dinner with friends", timestamp: "2025-09-03T20:15:00Z" },
  { mood_score: 2, note: "Stressful meetings", timestamp: "2025-09-04T11:45:00Z" },
  { mood_score: 4, note: "Evening walk was relaxing", timestamp: "2025-09-05T19:00:00Z" },
  { mood_score: 3, note: "Felt okay but low energy", timestamp: "2025-09-06T14:00:00Z" },
  { mood_score: 5, note: "Weekend family time ❤️", timestamp: "2025-09-07T21:30:00Z" },
  { mood_score: 4, note: "Started new book", timestamp: "2025-09-08T20:00:00Z" },
  { mood_score: 2, note: "Long work hours", timestamp: "2025-09-09T18:15:00Z" },
  { mood_score: 3, note: "Feeling neutral", timestamp: "2025-09-10T09:45:00Z" },
  { mood_score: 4, note: "Good workout session", timestamp: "2025-09-11T07:30:00Z" },
  { mood_score: 5, note: "Great mood today 🎉", timestamp: "2025-09-12T16:20:00Z" },
  { mood_score: 3, note: "Bit anxious but manageable", timestamp: "2025-09-13T13:10:00Z" },
  { mood_score: 4, note: "Relaxed Sunday", timestamp: "2025-09-14T19:40:00Z" },
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



// ---------- Dummy Journal Data ----------
const journalEntries: JournalEntry[] = [
  {
    id: "1",
    content: "Had a productive day and finished all my tasks.",
    sentiment: "positive",
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: "2",
    content: "Felt a bit stressed during meetings.",
    sentiment: "negative",
    timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
  },
  {
    id: "3",
    content: "Went for a walk and felt relaxed.",
    sentiment: "positive",
    timestamp: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
  },
];





// ---------- Dummy Resources Data ----------
const dummyResources: ResourceRec[] = [
  {
    id: "vid1",
    title: "Mindfulness Meditation for Beginners",
    type: "video",
    url: "https://www.youtube.com/watch?v=abcd1234",
    tags: ["meditation", "mindfulness", "relax"],
    snippet: "A short guided mindfulness meditation for beginners.",
    thumbnail: "https://img.youtube.com/vi/abcd1234/0.jpg",
  },
  {
    id: "vid2",
    title: "10-Minute Yoga Flow",
    type: "video",
    url: "https://www.youtube.com/watch?v=efgh5678",
    tags: ["yoga", "exercise", "fitness"],
    snippet: "Quick 10-minute yoga routine to energize your day.",
    thumbnail: "https://img.youtube.com/vi/efgh5678/0.jpg",
  },
  {
    id: "art1",
    title: "Understanding Stress & Anxiety",
    type: "article",
    url: "https://www.example.com/articles/stress-anxiety",
    tags: ["mental health", "stress", "anxiety"],
    snippet: "Learn simple techniques to manage stress and anxiety.",
  },
  {
    id: "aud1",
    title: "Calming Music for Focus",
    type: "audio",
    url: "https://www.example.com/audio/calm-track.mp3",
    tags: ["music", "focus", "relaxation"],
    snippet: "Listen to soft instrumental music to improve focus.",
  },
];




// ---------- Dummy Reminders Data ----------
const dummyReminders1: Reminder1[] = [
  { id: "r1", type: "Meditation", time: "08:00", message: "Morning session", enabled: true },
  { id: "r2", type: "Journal", time: "21:00", message: "Write thoughts", enabled: false },
];


// =====================
// Mock API service
// =====================
import type { ApiService } from "./api";

export const mockApiService: ApiService = {
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

   async register(name: string, email: string, _password: string): Promise<Token> {

     // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const password = _password;
    console.log("[mockApi] registering user:", { name, email });
    await new Promise((res) => setTimeout(res, 1000)); // simulate delay
    return {
      access_token: "mock-jwt-token-new-user",
      token_type: "bearer",
    };
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
      mood_score: input.score,
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

  async getReminderCount(): Promise<number> {
    console.log("[mockApi] getting reminder count");
    await delay(200);
    return dummyReminders1.length;
  },

  async googleAuth(idToken: string, timezone?: string): Promise<{ token: string; userId?: string }> {
    console.log("[mockApi] Google auth (mock)");
    await delay(500);
    return { token: "mock-google-token", userId: "google-user@example.com" };
  },

  async googleCodeExchange(code: string, codeVerifier: string, redirectUri: string, timezone?: string): Promise<{ token: string; userId?: string }> {
    console.log("[mockApi] Google code exchange (mock)");
    await delay(500);
    return { token: "mock-google-token", userId: "google-user@example.com" };
  },

  async logout(): Promise<void> {
    console.log("[mockApi] logout");
    await delay(200);
  },

  // ---------- Reminders ----------
  async getReminders(): Promise<Reminder[]> {
    console.log("[mockApi] fetching reminders");
    await delay(300);
    console.log("[mockApi] reminders returned:", dummyReminders);
    return dummyReminders;
  },

  /*async getReminderCount(): Promise<number> {
    console.log("[mockApi] getting reminder count");
    await delay(200);
    return dummyReminders.length;
  },

  async getUserProfile(): Promise<{ name: string; email: string }> {
    console.log("[mockApi] getting user profile");
    await delay(200);
    return { name: "Test User", email: "test@test.com" };
  },
*/
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
  // ---------- Journaling API Functions ----------
async getJournalInsights(): Promise<JournalInsights> {
  console.log("[mockApi] fetching journal insights");
  await delay(300);

  const totalEntries = journalEntries.length;
  const averageMoodScore =
    journalEntries.length > 0
      ? journalEntries
          .map((e) =>
            typeof e.sentiment === "number"
              ? e.sentiment
              : e.sentiment === "positive"
              ? 1
              : e.sentiment === "neutral"
              ? 0
              : -1
          )
          .reduce((a, b) => a + b, 0) / journalEntries.length
      : 0;

  const recentEntries = journalEntries
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const insights: JournalInsights = {
    entry_count: totalEntries,
    avg_sentiment: averageMoodScore,
    entries_per_day: totalEntries / 30 // rough calculation
  };
  console.log("[mockApi] journal insights:", insights);

  return insights;
},

async logJournal(input: { content: string }): Promise<JournalEntry> {
  console.log("[mockApi] logging journal entry:", input);
  await delay(200);

  const newEntry: JournalEntry = {
    id: (journalEntries.length + 1).toString(),
    content: input.content,
    sentiment: "neutral", // default sentiment
    timestamp: new Date().toISOString(),
  };

  journalEntries.push(newEntry);
  console.log("[mockApi] journal entry logged:", newEntry);

  return newEntry;
},
// Inside mockApiService
async getJournalHistory(): Promise<JournalEntry[]> {
  console.log("[mockApi] fetching journal history");
  await delay(300);
  console.log("[mockApi] journal history returned:", journalEntries);
  return journalEntries;
},
// Fetch content recommendations
  async getContentRecommendations(params?: { q?: string; tags?: string[]; limit?: number }): Promise<ResourceRec[]> {
    console.log("[mockApi] fetching content recommendations, params:", params);
    await delay(300);

    let filtered = dummyResources;

    // Filter by query
    if (params?.q) {
      filtered = filtered.filter((r) => r.title.toLowerCase().includes(params.q!.toLowerCase()));
    }

    // Filter by tags
    if (params?.tags && params.tags.length > 0) {
      filtered = filtered.filter((r) =>
        r.tags?.some((tag) => params.tags!.includes(tag))
      );
    }

    // Limit results
    if (params?.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    console.log("[mockApi] returning content recommendations:", filtered);
    return filtered;
  },





  // --- GET all reminders ---
  async getReminders1(): Promise<Reminder1[]> {
    console.log("[mockApi] fetching reminders");
    await delay(300);
    return dummyReminders1;
  },

  // --- ADD reminder ---
  async addReminder(newReminder: Omit<Reminder1, "id">): Promise<Reminder1> {
    console.log("[mockApi] adding reminder:", newReminder);
    await delay(300);
    const reminder: Reminder1 = {
      id: `r${Math.floor(Math.random() * 10000)}`,
      ...newReminder,
    };
    return reminder;
  },

  /*
  // --- TOGGLE reminder enabled/disabled ---
  async toggleReminder(id: string): Promise<Reminder1 | undefined> {
    console.log("[mockApi] toggling reminder:", id);
    await delay(300);
    const reminder = dummyReminders1.find((r) => r.id === id);
    if (!reminder) return undefined;
    return { ...reminder, enabled: !reminder.enabled };
  },
*/
  // --- DELETE reminder ---
  async deleteReminder(id: string): Promise<{ success: boolean }> {
    console.log("[mockApi] deleting reminder:", id);
    await delay(300);
    const exists = dummyReminders1.some((r) => r.id === id);
    return { success: exists };
  },

  // --- Get memory summary ---
  async getMemorySummary(): Promise<MemorySummary> {
    console.log("[mockApi] fetching memory summary");
    await delay(300);
    const summary: MemorySummary = {
      summary: "You've been tracking your mood consistently over the past 2 weeks. Your journal entries show themes of work stress, family time, and self-care activities. Overall, you're maintaining a positive outlook with occasional challenges.",
      journal_count: journalEntries.length,
      mood_count: dummyMoodHistory.length,
      days_tracked: 14,
      last_updated: new Date().toISOString(),
      key_themes: ["work stress", "family time", "self-care", "productivity", "relaxation"],
    };
    console.log("[mockApi] returning memory summary:", summary);
    return summary;
  },

};













// Types
export type MoodLog = {
  id: number;
  user_id?: string;
  mood_score: number; // 1-5 scale
  note?: string;
  timestamp: string;
};

export type MoodTrend = {
  date: string; // YYYY-MM-DD
  avg_mood: number;
};

// Dummy data - last 14 days
export const dummyMoodHistory: MoodLog[] = [
  { id: 1, mood_score: 3, note: "Monday blues but manageable", timestamp: "2024-01-15T08:30:00Z" },
  { id: 2, mood_score: 4, note: "Good progress at work", timestamp: "2024-01-14T09:15:00Z" },
  { id: 3, mood_score: 5, note: "Great weekend with family!", timestamp: "2024-01-13T18:45:00Z" },
  { id: 4, mood_score: 2, note: "Felt tired and stressed", timestamp: "2024-01-12T20:20:00Z" },
  { id: 5, mood_score: 3, note: "Okay day, nothing special", timestamp: "2024-01-11T11:10:00Z" },
  { id: 6, mood_score: 4, note: "Productive day, finished tasks", timestamp: "2024-01-10T16:40:00Z" },
  { id: 7, mood_score: 1, note: "Overwhelmed with deadlines", timestamp: "2024-01-09T22:00:00Z" },
  { id: 8, mood_score: 2, note: "Couldn’t focus much today", timestamp: "2024-01-08T13:50:00Z" },
  { id: 9, mood_score: 3, note: "Decent, went for a walk", timestamp: "2024-01-07T17:25:00Z" },
  { id: 10, mood_score: 4, note: "Enjoyed working out", timestamp: "2024-01-06T09:45:00Z" },
];

// Daily averages for trends
export const dummyMoodTrends: MoodTrend[] = [
  { date: "2024-01-15", avg_mood: 3 },
  { date: "2024-01-14", avg_mood: 4 },
  { date: "2024-01-13", avg_mood: 5 },
  { date: "2024-01-12", avg_mood: 2 },
  { date: "2024-01-11", avg_mood: 3 },
  { date: "2024-01-10", avg_mood: 4 },
  { date: "2024-01-09", avg_mood: 1 },
  { date: "2024-01-08", avg_mood: 2 },
  { date: "2024-01-07", avg_mood: 3 },
  { date: "2024-01-06", avg_mood: 4 },

];


// Mock API
export const moodApi = {
  getMoodHistory: async (): Promise<MoodLog[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(dummyMoodHistory), 500));
  },

  logMood: async ({ score, note }: { score: number; note?: string }): Promise<MoodLog> => {
    const newLog: MoodLog = {
      id: dummyMoodHistory.length + 1,
      mood_score: score,
      note,
      timestamp: new Date().toISOString(),
    };
    dummyMoodHistory.unshift(newLog);
    return new Promise((resolve) => setTimeout(() => resolve(newLog), 500));
  },

  getMoodTrends: async (): Promise<MoodTrend[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(dummyMoodTrends), 500));
  },
};

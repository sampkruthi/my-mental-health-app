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

// Dummy data
export const dummyMoodHistory: MoodLog[] = [
  { id: 1, mood_score: 4, note: "Feeling good today, accomplished a lot", timestamp: "2024-01-15T10:30:00Z" },
  { id: 2, mood_score: 2, note: "Stressful day at work, deadline pressure", timestamp: "2024-01-14T09:15:00Z" },
  { id: 3, mood_score: 5, note: "Amazing weekend with friends!", timestamp: "2024-01-13T18:45:00Z" },
];

export const dummyMoodTrends: MoodTrend[] = [
  { date: "2024-01-15", avg_mood: 3.5 },
  { date: "2024-01-14", avg_mood: 2.8 },
  { date: "2024-01-13", avg_mood: 4.2 },
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

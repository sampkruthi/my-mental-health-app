// types.ts
export interface MoodTrendPoint {
  avg?: number; // or whatever fields your API returns
  date?: string;
}

export interface Reminder {
  id: number;
  message: string;
  dueDate?: string;
}





export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string; // ISO format like "2025-09-09T14:32:00Z"
}

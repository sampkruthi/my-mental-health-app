// types.ts
import { ImageSourcePropType } from "react-native";


export interface MoodTrendPoint {
  avg?: number; // or whatever fields your API returns
  date?: string;
}

export interface Reminder {
  id: number;
  message: string;
  dueDate?: string;
}



// =====================
// Auth
// =====================

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
}
export interface Token {
  access_token: string;
  token_type: string;
}




export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string; // ISO format like "2025-09-09T14:32:00Z"
}

// =====================
// Mood log type
// =====================
export interface MoodLog {
  id: string;                 // Unique ID for each log entry
  score: number;              // Mood score (e.g., 1–5 scale)
  note?: string;              // Optional user note about the mood
  timestamp: string;          // ISO format like "2025-09-09T14:32:00Z"
}


// Guided Activity

export interface GuidedActivity {
  id: string;
  title: string;
  type: "Breathing" | "Meditation" | "Stretching" | "Walking" | "Music" | "Exercise";
  description: string;
  thumbnail: ImageSourcePropType;  // 👈 instead of number | string
  steps: string[];
  audioFile?: string; 
  duration?: number;
}


// =====================
// JournalingScreen
// =====================



export interface JournalEntry {
  id?: string;
  content: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | number; // backend choice
  timestamp: string;    // ISO
}

export interface JournalInsights {
  totalEntries: number;
  averageMoodScore?: number;
  recentEntries?: JournalEntry[];
}

// =====================
// ResourcesScreen
// =====================


export interface ResourceRec {
  id: string;
  title: string;
  type: 'article' | 'audio' | 'video';
  url: string;
  tags?: string[];
  snippet?: string;
  thumbnail?: string;
}




export interface Reminder1 {
  id: string;
  type: string;     // "Meditation", "Journal", etc.
  time: string;     // "08:00" or "21:00" (HH:mm format)
  message: string;
  enabled: boolean; // true = active, false = off
}

export type NewReminder = Omit<Reminder1, "id">; // creating one
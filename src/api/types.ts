// types.ts
import { ImageSourcePropType } from "react-native";


// Updated to match OpenAPI MoodTrend schema
export interface MoodTrendPoint {
  date: string;                 // required date string
  avg_mood: number;             // required average mood score
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
// Updated to match OpenAPI MoodEntry schema
export interface MoodLog {
  timestamp: string;          // ISO format date-time
  mood_score: number;         // Mood score (integer)
  note: string | null;        // Note (can be null)
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



// Updated to match OpenAPI JournalEntryResponse schema
export interface JournalEntry {
  id: number;                 // integer ID from backend
  content: string;
  sentiment: number;          // numeric sentiment score
  timestamp: string;          // ISO date-time format
}

// Updated to match OpenAPI JournalInsightResponse schema
export interface JournalInsights {
  avg_sentiment: number | null;
  entry_count: number;
  entries_per_day: number;
}

// =====================
// ResourcesScreen
// =====================


export interface ResourceRec {
  id: number;
  title: string;
  url: string;
  content_type: 'article' | 'podcast' | 'video';
  tags: string[];
  thumbnail?: string;
  snippet?: string;
  score?: number; //Optional since it comes from FAISS
  recommendation_reason?: string;
}

// Content data model - matches ContentDTO from backend
export interface Content {
  id: number;
  title: string;
  url: string;
  content_type: 'article' | 'podcast' | 'video';
  tags: string[];
  thumbnail?: string;
  snippet?: string;
  score: number;  // FAISS score (smaller distance = closer match)
  recommendation_reason?: string;
}

// RAG Recommendation - enhanced content with relevance score
export interface RAGRecommendation {
  id: number;
  title: string;
  description?: string;
  url: string;
  content_type: 'article' | 'podcast' | 'video';
  tags: string[];
  thumbnail?: string;
  snippet?: string;
  score: number;  // FAISS score (smaller distance = closer match)
  relevance_score: number;  // Similarity score (0-1, higher = better)
}

// RAG Response - complete response with recommendations and summary
export interface ResourceRecRAG {
  recommendations: RAGRecommendation[];
  personalized_summary: string;
  query: string;
  user_context: Record<string, any>;
}




// Updated to match OpenAPI ReminderResponse schema
export interface Reminder1 {
  id: number;                 // integer ID from backend
  type: string;               // reminder type
  hour: number;               // hour (0-23)
  minute: number;             // minute (0-59)
  message: string;
  // Note: 'enabled' field doesn't exist in OpenAPI - remove or handle separately
}

// Type for creating new reminders (matches OpenAPI ReminderRequest schema)
export interface NewReminder {
  type: string;                 // pattern: ^(meditation|journaling|hydration|activity)$
  hour: number;                 // 0-23
  minute: number;               // 0-59
  message: string;
}

// Add MoodRequest type to match OpenAPI schema
export interface MoodRequest {
  mood_score: number;           // integer, required
  note?: string | null;         // optional note
}

// Add ChatResponse type to match updated OpenAPI schema
export interface ChatResponse {
  response: string;                           // required
  safety_metadata?: Record<string, any> | null;
  crisis_intervention?: boolean | null;       // default: false
  usage_info?: Record<string, any> | null;
  debug_info?: Record<string, any> | null;
}

// Updated to match OpenAPI ActivityResponseDTO schema
export interface ActivityResponse {
  id: number;                   // integer ID from backend
  title: string;
  type: string;                 // activity type
  description: string;
  script: string;               // activity script/instructions
}

// Keep GuidedActivity for frontend compatibility (with local fields)
// This extends ActivityResponse with frontend-specific fields
export interface GuidedActivity extends Omit<ActivityResponse, 'id'> {
  id: string;                   // frontend uses string IDs
  type: "Breathing" | "Meditation" | "Stretching" | "Walking" | "Music" | "Exercise";
  thumbnail: ImageSourcePropType;
  steps: string[];
  audioFile?: string;
  duration?: number;
}

// src/api/types.ts

export interface MemorySummary {
  summary: string;
  journal_count: number;
  mood_count: number;
  days_tracked: number;
  last_updated: string;
  key_themes: string[];
}

// src/api/types.ts

export interface ProgressDashboard {
  mood_trend: 'improving' | 'stable' | 'declining';
  mood_change_percent: number;
  journal_consistency: number;
  current_streak: number;
  longest_streak: number;
  total_entries: number;
  avg_sentiment: number | null;
}
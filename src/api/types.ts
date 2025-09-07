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

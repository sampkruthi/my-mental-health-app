import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { MoodTrendPoint, Reminder } from "./types";
import { getApiService } from "../../services/api"; // adjust path if needed
import type { ChatMessage, MoodLog, GuidedActivity, JournalEntry, JournalInsights } from "./types";

// =====================
// Login mutation hook
// =====================
type LoginPayload = { email: string; password: string };
type LoginResponse = { token: string };



export const useLogin = () => {
  // ✅ Logs for debugging
  console.log("[useLogin] Using API service:", getApiService());

  return useMutation({
    mutationFn: async ({ email, password }: LoginPayload) => {
      if (!getApiService) throw new Error("API Service not initialized");
      console.log("[useLogin] Attempting login with:", email, password);

      const data: LoginResponse = await getApiService().login(email, password);
      console.log("[useLogin] Login response received:", data);
      return data;
    },
  });
};

// =====================
// Mood count hook
// =====================
export function useFetchMoodCount(token?: string | null) {
  return useQuery<number, Error>({
    queryKey: ["mood", "count", token],
    queryFn: async () => {
      console.log("[useFetchMoodCount] Fetching mood count, token:", token);
      if (!token) return 0;

      const data: MoodTrendPoint[] = await getApiService().getMoodTrends?.() ?? [];
      console.log("[useFetchMoodCount] Data received:", data);

      const count = data.reduce((acc, p) => acc + (p.avg ? 1 : 0), 0);
      console.log("[useFetchMoodCount] Mood count calculated:", count);
      return count;
    },
    enabled: Boolean(token),
    staleTime: 60000,
  });
}

// =====================
// Reminder count hook
// =====================
export function useFetchReminderCount(token?: string | null) {
  return useQuery<number, Error>({
    queryKey: ["reminders", "count", token],
    queryFn: async () => {
      console.log("[useFetchReminderCount] Fetching reminders, token:", token);
      if (!token) return 0;

      const data: Reminder[] = await getApiService().getReminders?. () ?? [];
      console.log("[useFetchReminderCount] Data received:", data);

      const count = Array.isArray(data) ? data.length : 0;
      console.log("[useFetchReminderCount] Reminder count calculated:", count);
      return count;
    },
    enabled: Boolean(token),
    staleTime: 30000,
  });
}



// =====================
// Chat history hook
// =====================
export function useFetchChatHistory(token?: string | null) {
  return useQuery<ChatMessage[], Error>({
    queryKey: ["chat", "history", token],
    queryFn: async () => {
      console.log("[useFetchChatHistory] Fetching chat history, token:", token);
      if (!token) return [];

      const data: ChatMessage[] = await getApiService().getChatHistory?.() ?? [];
      console.log("[useFetchChatHistory] Chat history returned:", data);
      return data;
    },
    enabled: Boolean(token),
    staleTime: 30000,
  });
}

// =====================
// Send chat message hook
// =====================
export function useSendChatMessage(token?: string | null) {
  return useMutation<ChatMessage, Error, { text: string }>({
    mutationFn: async ({ text }) => {
      console.log("[useSendChatMessage] Sending message:", text, "token:", token);
      if (!token) throw new Error("No token available");

      const data: ChatMessage = await getApiService().sendChatMessage?.(text) as ChatMessage;
      console.log("[useSendChatMessage] Bot reply received:", data);
      return data;
    },
  });
}

// =====================
// Mood history hook
// =====================
export function useFetchMoodHistory(token?: string | null) {
  return useQuery<MoodLog[], Error>({
    queryKey: ["mood", "history", token],
    queryFn: async () => {
      console.log("[useFetchMoodHistory] Fetching mood history, token:", token);
      if (!token) return [];

      const data: MoodLog[] = await getApiService().getMoodHistory?.() ?? [];
      console.log("[useFetchMoodHistory] Mood history returned:", data);
      return data;
    },
    enabled: Boolean(token),
    staleTime: 30000,
  });
}

// =====================
// Log mood hook
// =====================
export function useLogMood(token?: string | null) {
  return useMutation<MoodLog, Error, { score: number; note?: string }>({
    mutationFn: async ({ score, note }) => {
      console.log("[useLogMood] Logging mood:", { score, note }, "token:", token);
      if (!token) throw new Error("No token available");

      const data: MoodLog = await getApiService().logMood?.({ score, note }) as MoodLog;

      console.log("[useLogMood] Mood log response:", data);
      return data;
    },
  });
}

// =====================
// Guided Activity
// =====================

// Fetch activities
export function useFetchActivities(token?: string | null) {
  return useQuery<GuidedActivity[], Error>({
    queryKey: ["activities", token],
    queryFn: async () => {
      if (!token) return [];
      return getApiService().getActivities?.() ?? [];
    },
    enabled: Boolean(token),
    staleTime: 30000,
  });
}

// Log activity
export function useLogActivity(token?: string | null) {
  return useMutation<{ id: string; completedAt: string }, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      if (!token) throw new Error("No token available");
      const data = await getApiService().logActivity?.(id);
      if (!data) throw new Error("No response from API");
      return data;
    },
  });
}




// =====================
// Journal Hooks
// =====================

// Fetch journal history
export function useFetchJournalHistory(token?: string | null) {
  return useQuery<JournalEntry[], Error>({
    queryKey: ["journal", "history", token],
    queryFn: async () => {
      console.log("[useFetchJournalHistory] Fetching journal history, token:", token);
      if (!token) return [];

      const data: JournalEntry[] = await getApiService().getJournalHistory?.() ?? [];
      console.log("[useFetchJournalHistory] Data received:", data);
      return data;
    },
    enabled: Boolean(token),
    staleTime: 60_000,
  });
}

/// Fetch journal insights
export function useFetchJournalInsights(token?: string | null) {
  return useQuery<JournalInsights | null, Error>({
    queryKey: ["journal", "insights", token],
    queryFn: async () => {
      console.log("[useFetchJournalInsights] Fetching journal insights, token:", token);
      if (!token) return null;

      const data: JournalInsights = await getApiService().getJournalInsights?.() ?? { totalEntries: 0 };
      console.log("[useFetchJournalInsights] Insights received:", data);
      return data;
    },
    enabled: Boolean(token),
    staleTime: 60_000,
  });
}


// Log a new journal entry
export function useLogJournal(token?: string | null) {
  const qc = useQueryClient();

  return useMutation<JournalEntry, Error, { content: string }>({
    mutationFn: async ({ content }) => {
      console.log("[useLogJournal] Logging journal entry:", content, "token:", token);
      if (!token) throw new Error("No token available");

      const data: JournalEntry = await getApiService().logJournal?.({ content }) as JournalEntry;
      console.log("[useLogJournal] Journal entry logged:", data);
      return data;
    },
    onSuccess: () => {
      console.log("[useLogJournal] Invalidating journal queries");
      qc.invalidateQueries({ queryKey: ["journal", "history"] });
      qc.invalidateQueries({ queryKey: ["journal", "insights"] });
    },
  });
}

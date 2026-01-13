import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getApiService } from "../../services/api"; // adjust path if needed
import type { Reminder,  ChatMessage, MoodLog, GuidedActivity, JournalEntry, 
JournalInsights, ResourceRec, Reminder1, NewReminder, MemorySummary, Token, RegisterRequest, ProgressDashboard, ResourceRecRAG } from "./types";




import {  UseMutationResult } from "@tanstack/react-query";


// =====================
// Login mutation hook
// =====================
type LoginPayload = { email: string; password: string };
type LoginResponse = { token: string, userId?: string };



export const useLogin = () => {
  // ✅ Logs for debugging
  console.log("[useLogin] Using API service:", getApiService());

  return useMutation({
    mutationFn: async ({ email, password }: LoginPayload) => {
      if (!getApiService) throw new Error("API Service not initialized");
      console.log("[useLogin] Attempting login with:", email, password);

      //const data: LoginResponse = await getApiService().login(email, password);
      const { token, userId} : LoginResponse = await getApiService().login(email, password);
      console.log("[useLogin] Login response received:", {token, userId});
      return {token, userId};
    },
  });
};


export function useRegister(): UseMutationResult<Token, Error, RegisterRequest, unknown> {
  const qc = useQueryClient();

  return useMutation<Token, Error, RegisterRequest>({
    mutationFn: async ({ name, email, password }) => {
      console.log("[useRegister] registering:", { name, email });
      const data: Token = await getApiService().register(name, email, password);
      console.log("[useRegister] token received:", data);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries(); // optional: refresh other queries
      console.log("[useRegister] registration successful, token:", data.access_token);
    },
    onError: (error) => {
      console.error("[useRegister] registration failed:", error);
    }
  });
}



// =====================
// Mood count hook
// =====================
export function useFetchMoodCount(token?: string | null) {
  return useQuery<number, Error>({
    queryKey: ["mood", "count", token],
    queryFn: async () => {
      console.log("[useFetchMoodCount] Fetching mood count, token:", token);
      if (!token) return 0;

      const data: MoodLog[] = await getApiService().getMoodHistory?.() ?? [];
      console.log("[useFetchMoodCount] Mood Data  received:", data);

      const count = Array.isArray(data) ? data.length : 0;
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

      const data: Reminder[] = await getApiService().getReminders1?. () ?? [];
      console.log("[useFetchReminderCount] Data received:", data);

      const count = Array.isArray(data) ? data.length : 0;
      console.log("[useFetchReminderCount] Reminder count calculated:", count);
      return count;
    },
    enabled: Boolean(token),
    staleTime: 30000,
  });
}

// Paginated chat history hook

export function useFetchChatHistory(
  token?: string | null,
  limit: number = 20,
  offset: number = 0
) {
  return useQuery({
    queryKey: ["chat", "history", token, limit, offset],
    queryFn: async () => {
      console.log(`[useFetchChatHistory] Fetching history: limit=${limit}, offset=${offset}`);
      if (!token) return { messages: [], total_count: 0, has_more: false };

      const data = await getApiService().getChatHistory?.(limit, offset) ?? {
        messages: [],
        total_count: 0,
        has_more: false
      };
      
      console.log(`[useFetchChatHistory] Loaded ${data.messages.length} messages, has_more=${data.has_more}`);
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

      const data: JournalInsights = await getApiService().getJournalInsights?.() ?? {
        avg_sentiment: null,
        entry_count: 0,
        entries_per_day: 0
      };
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

// =====================
// Resources Hooks
// =====================


export function useFetchContentRec(
  token: string | null | undefined,
  params?: { q?: string; tags?: string[]; limit?: number }
) {
  return useQuery<ResourceRec[], Error>({
    queryKey: ['resources', 'recs', params, token],
    queryFn: async () => {
      if (!token) return [];

      const data: ResourceRec[] = await getApiService().getContentRecommendations?.(params) ?? [];
      return data;
    },
    enabled: Boolean(token),
    staleTime: 60_000, // 1 minute
  });
}

export function useFetchContentRecWithRAG(
  token: string | null | undefined,
  params?: {  limit?: number }
) {
  return useQuery<ResourceRecRAG, Error>({
    queryKey: ['resources', 'recs-rag', params, token],
    queryFn: async () => {
      if (!token) return { recommendations: [], personalized_summary: '', query: '', user_context: {} };

      const data: ResourceRecRAG = await getApiService().getContentRecommendationsRag?.(params) ?? {
        recommendations: [],
        personalized_summary: '',
        query: '',
        user_context: {}
      };
      return data;
    },
    enabled: Boolean(token),
    staleTime: 60_000, // 1 minute
  });
}




// =====================
// Fetch reminders
// =====================
export function useFetchReminders(token?: string | null) {
  return useQuery<Reminder1[], Error>({
    queryKey: ["reminders", "list", token],
    queryFn: async () => {
      console.log("[useFetchReminders] Fetching reminders, token:", token);
      if (!token) return [];

      const data: Reminder1[] = await getApiService().getReminders1?.() ?? [];
      console.log("[useFetchReminders] Data received:", data);
      return data;
    },
    enabled: Boolean(token),
    staleTime: 30000,
  });
}

// =====================
// Add reminder
// =====================
export function useAddReminder(token?: string | null) {
  const qc = useQueryClient();

  return useMutation<Reminder1, Error, NewReminder>({
    mutationFn: async (input) => {
      console.log("[useAddReminder] Adding reminder:", input, "token:", token);
      if (!token) throw new Error("No token provided");

      const data: Reminder1 = await getApiService().addReminder?.(input) as Reminder1;
      console.log("[useAddReminder] Reminder added:", data);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders", "list", token] });
    },
  });
}

// =====================
// Delete reminder
// =====================
export function useDeleteReminder(token?: string | null) {
  const qc = useQueryClient();

  return useMutation<string, Error, string>({
    mutationFn: async (id) => {
      console.log("[useDeleteReminder] Deleting reminder:", id, "token:", token);
      if (!token) throw new Error("No token provided");

      await getApiService().deleteReminder?.(id);
      console.log("[useDeleteReminder] Reminder deleted:", id);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders", "list", token] });
    },
  });
}





// =====================
// Toggle reminder (enable/disable)
// =====================
export function useToggleReminder(token?: string | null) {
  const qc = useQueryClient();

  return useMutation<Reminder1, Error, { id: string; enabled: boolean }>({
    mutationFn: async ({ id, enabled }) => {
      console.log("[useToggleReminder] Toggling reminder:", id, "to:", enabled, "token:", token);
      if (!token) throw new Error("No token provided");

      const data: Reminder1 = await getApiService().toggleReminder?.(id) as Reminder1;
      console.log("[useToggleReminder] Reminder updated:", data);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders", "list", token] });
    },
  });
}

export function useFetchMemorySummary(token?: string | null) {
  return useQuery<MemorySummary, Error>({
    queryKey: ["memory", "summary", token],
    queryFn: async () => {
      console.log("[useFetchMemorySummary] Fetching memory summary, token:", token);
      
      if (!token) {
        throw new Error("No authentication token available");
      }

      const data = await getApiService().getMemorySummary?.();
      
      if (!data) {
        throw new Error("No memory summary data returned");
      }
      
      console.log("[useFetchMemorySummary] Memory summary received:", data);
      return data; // Now guaranteed to be MemorySummary, not null
    },
    enabled: Boolean(token),
    staleTime: 60000, // Cache for 1 minute
  });
}

// src/api/hooks.ts

export function useFetchProgressDashboard(token?: string | null) {
  return useQuery<ProgressDashboard, Error>({
    queryKey: ["progress", "dashboard", token],
    queryFn: async () => {
      console.log("[useFetchProgressDashboard] Fetching progress, token:", token);
      if (!token) return null;

      const data = await getApiService().getProgressDashboard?.();
      console.log("[useFetchProgressDashboard] Progress data received:", data);
      return data;
    },
    enabled: Boolean(token),
    staleTime: 300000, // Cache for 5 minutes
  });
}


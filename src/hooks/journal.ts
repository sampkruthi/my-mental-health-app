// src/hooks/journal.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { JournalEntry, JournalInsights } from "../../services/mock_data/journal";
import { journalApi } from "../../services/mock_data/journal";

// Fetch journal history
export function useFetchJournalHistory(token?: string | null) {
  return useQuery<JournalEntry[], Error>({
    queryKey: ["journal", "history", token],
    queryFn: async () => {
      if (!token) return [];
      return journalApi.getJournalHistory();
    },
    enabled: Boolean(token),
    staleTime: 60_000,
  });
}

// Fetch journal insights
export function useFetchJournalInsights(token?: string | null) {
  return useQuery<JournalInsights | null, Error>({
    queryKey: ["journal", "insights", token],
    queryFn: async () => {
      if (!token) return null;
      return journalApi.getJournalInsights();
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
      if (!token) throw new Error("No token available");
      return journalApi.logJournal({ content });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal", "history"] });
      qc.invalidateQueries({ queryKey: ["journal", "insights"] });
    },
  });
}

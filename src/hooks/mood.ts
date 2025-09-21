import { useQuery, useMutation } from "@tanstack/react-query";
import type { MoodLog, MoodTrend } from "../../services/mock_data/mood";
import { moodApi } from "../../services/mock_data/mood";

// Fetch mood history
export function useFetchMoodHistory() {
  return useQuery<MoodLog[], Error>({
    queryKey: ["mood", "history"],
    queryFn: moodApi.getMoodHistory,
    staleTime: 30000,
  });
}

// Log a new mood
export function useLogMood() {
  return useMutation<MoodLog, Error, { score: number; note?: string }>({
    mutationFn: ({ score, note }) => moodApi.logMood({ score, note }),
  });
}

// Fetch mood trends
export function useFetchMoodTrends() {
  return useQuery<MoodTrend[], Error>({
    queryKey: ["mood", "trends"],
    queryFn: moodApi.getMoodTrends,
    staleTime: 60000,
  });
}


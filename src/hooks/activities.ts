// src/hooks/activity.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { GuidedActivity } from "../../services/mock_data/activities";
import { activityApi } from "../../services/mock_data/activities";

// Fetch activities
export function useFetchActivities(token?: string | null) {
  return useQuery<GuidedActivity[], Error>({
    queryKey: ["activities", token],
    queryFn: async () => {
      if (!token) return [];
      return activityApi.getActivities();
    },
    enabled: Boolean(token),
    staleTime: 30_000,
  });
}

// Log activity completion
export function useLogActivity(token?: string | null) {
  const qc = useQueryClient();
  return useMutation<{ id: string; completedAt: string }, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      if (!token) throw new Error("No token available");
      return activityApi.logActivity(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

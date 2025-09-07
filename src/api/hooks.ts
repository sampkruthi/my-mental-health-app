import { useQuery, useMutation } from "@tanstack/react-query";
import { createClient } from "./axios"; // adjust path if needed
import type { MoodTrendPoint, Reminder } from "./types";

// =====================
// Login mutation hook
// =====================
type LoginPayload = { email: string; password: string };
type LoginResponse = { token: string };

export const useLogin = () => {
  const client = createClient();

  // ✅ Logs for debugging
  console.log("[useLogin] Axios baseURL:", client.defaults.baseURL);
  console.log("[useLogin] Full request URL:", client.defaults.baseURL + "/auth/login");

  return useMutation({
    mutationFn: async ({ email, password }: LoginPayload) => {
      console.log("[useLogin] Attempting login with:", email, password);
      const { data } = await client.post<LoginResponse>("/auth/login", { email, password });
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

      const { data } = await createClient(token).get<MoodTrendPoint[]>("/mood/trends");
      console.log("[useFetchMoodCount] Data received:", data);

      if (!Array.isArray(data)) return 0;
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

      const { data } = await createClient(token).get<Reminder[]>("/reminders");
      console.log("[useFetchReminderCount] Data received:", data);

      const count = Array.isArray(data) ? data.length : 0;
      console.log("[useFetchReminderCount] Reminder count calculated:", count);
      return count;
    },
    enabled: Boolean(token),
    staleTime: 30000,
  });
}

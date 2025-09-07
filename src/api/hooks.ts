import { useQuery } from '@tanstack/react-query';
import { createClient } from './axios'; // adjust path if needed
import type { MoodTrendPoint, Reminder } from './types';

// Mood count hook
export function useFetchMoodCount(token?: string | null) {
  return useQuery<number, Error>({
    queryKey: ['mood', 'count', token],
    queryFn: async () => {
      if (!token) return 0; // early exit if no token
      const { data } = await createClient(token).get<MoodTrendPoint[]>('/mood/trends');
      if (!Array.isArray(data)) return 0;
      return data.reduce((acc, p) => acc + (p.avg ? 1 : 0), 0);
    },
    enabled: Boolean(token), // React Query won't run without token
    staleTime: 60000,
  });
}

// Reminder count hook
export function useFetchReminderCount(token?: string | null) {
  return useQuery<number, Error>({
    queryKey: ['reminders', 'count', token],
    queryFn: async () => {
      if (!token) return 0;
      const { data } = await createClient(token).get<Reminder[]>('/reminders');
      return Array.isArray(data) ? data.length : 0;
    },
    enabled: Boolean(token),
    staleTime: 30000,
  });
}

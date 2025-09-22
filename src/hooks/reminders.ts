import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reminderApi, Reminder, NewReminder } from "../../services/mock_data/reminders";

// Fetch reminders
export const useFetchReminders = () => {
  return useQuery<Reminder[], Error>({
    queryKey: ["reminders"],
    queryFn: reminderApi.getReminders,
    staleTime: 30000,
  });
};

// Add reminder
export const useAddReminder = () => {
  const qc = useQueryClient();
  return useMutation<Reminder, Error, NewReminder>({
    mutationFn: reminderApi.addReminder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });
};

// Toggle reminder
export const useToggleReminder = () => {
  const qc = useQueryClient();
  return useMutation<Reminder, Error, string>({
    mutationFn: reminderApi.toggleReminder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });
};

// Delete reminder
export const useDeleteReminder = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: reminderApi.deleteReminder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });
};

import { useQuery, useMutation } from "@tanstack/react-query";
import type { ChatMessage } from "../../services/mock_data/chat";
import { chatApi } from "../../services/mock_data/chat";

// =====================
// Fetch chat history
// =====================
export function useFetchChatHistory() {
  return useQuery<ChatMessage[], Error>({
    queryKey: ["chat", "history"],
    queryFn: chatApi.getChatHistory,
    staleTime: 30000,
  });
}

// =====================
// Send chat message
// =====================
export function useSendChatMessage() {
  return useMutation<ChatMessage, Error, { text: string }>({
    mutationFn: ({ text }) => chatApi.sendChatMessage(text),
  });
}

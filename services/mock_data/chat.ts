// =====================
// Types
// =====================
export type ChatMessage = {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
};

export type SafetyMetadata = {
  risk_level: "assessed" | "unassessed";
  crisis_mode: boolean;
  timestamp: string;
};

export type UsageInfo = {
  daily_messages: number;
  session_messages: number;
  is_crisis_mode: boolean;
};

export type DebugInfo = {
  input_analysis?: Record<string, unknown>;
  processing?: Record<string, unknown>;
} | null;

export type ApiChatResponse = {
  response: string;
  safety_metadata?: SafetyMetadata;
  crisis_intervention?: boolean;
  usage_info?: UsageInfo;
  debug_info?: DebugInfo;
};

// =====================
// Dummy chat data
// =====================
export const dummyChatHistory: ChatMessage[] = [
  { id: "1a", sender: "user", text: "Hey, I feel a bit stressed today.", timestamp: "2025-09-08T10:00:00Z" },
  { id: "2b", sender: "ai", text: "I understand. Want me to guide you through a quick breathing exercise?", timestamp: "2025-09-08T10:01:00Z" },
];

// =====================
// Mock API
// =====================
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const chatApi = {
  async getChatHistory(): Promise<ChatMessage[]> {
    await delay(300);
    return dummyChatHistory;
  },

  async sendChatMessage(text: string): Promise<ChatMessage> {
    await delay(400);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    };
    dummyChatHistory.push(userMessage);

    const apiReply: ApiChatResponse = {
      response: "Thanks for sharing. Remember to take a deep breath 🌿",
      safety_metadata: { risk_level: "assessed", crisis_mode: false, timestamp: new Date().toISOString() },
      crisis_intervention: false,
      usage_info: { daily_messages: 5, session_messages: 1, is_crisis_mode: false },
      debug_info: null,
    };

    const botReply: ChatMessage = {
      id: Date.now().toString() + "r",
      sender: "ai",
      text: apiReply.response,
      timestamp: new Date().toISOString(),
    };

    dummyChatHistory.push(botReply);
    return botReply;
  },
};

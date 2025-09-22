// src/services/mock_data/journal.ts

// ---------- Types ----------
export type JournalEntry = {
  id: string;
  content: string;
  sentiment: "positive" | "neutral" | "negative";
  timestamp: string;
};

export type JournalInsights = {
  totalEntries: number;
  averageMoodScore: number; // -1 to 1
  recentEntries: JournalEntry[];
};

// ---------- Dummy Journal Data for 7 days ----------
const journalEntries: JournalEntry[] = [
  { id: "1", content: "Had a productive day and finished all tasks.", sentiment: "positive", timestamp: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: "2", content: "Felt stressed during meetings.", sentiment: "negative", timestamp: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: "3", content: "Went for a walk, felt relaxed.", sentiment: "positive", timestamp: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: "4", content: "Overwhelmed with deadlines.", sentiment: "negative", timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "5", content: "Had a nice family dinner.", sentiment: "positive", timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "6", content: "Felt neutral, nothing special happened.", sentiment: "neutral", timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: "7", content: "Completed a small project successfully.", sentiment: "positive", timestamp: new Date().toISOString() },
];

// ---------- Mock API ----------
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const journalApi = {
  async getJournalHistory(): Promise<JournalEntry[]> {
    await delay(300);
    return journalEntries;
  },

  async getJournalInsights(): Promise<JournalInsights> {
    await delay(300);
    const totalEntries = journalEntries.length;
    const averageMoodScore =
      journalEntries.reduce((sum, e) => {
        if (e.sentiment === "positive") return sum + 1;
        if (e.sentiment === "neutral") return sum + 0;
        return sum - 1;
      }, 0) / totalEntries;

    const recentEntries = journalEntries
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    return { totalEntries, averageMoodScore, recentEntries };
  },

  async logJournal(input: { content: string }): Promise<JournalEntry> {
    await delay(200);
    const newEntry: JournalEntry = {
      id: (journalEntries.length + 1).toString(),
      content: input.content,
      sentiment: "neutral",
      timestamp: new Date().toISOString(),
    };
    journalEntries.push(newEntry);
    return newEntry;
  },
};

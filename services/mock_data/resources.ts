// services/mock_data/resources.ts
import { delay } from "../../src/extra/delay"; // utility to simulate API delay

export type ResourceRec = {
  id: string;
  title: string;
  url: string;
  type: "article" | "audio" | "video";
  tags?: string[];
  snippet?: string;
  thumbnail?: string;
  score?: number;
};

// ---------- Dummy Resources Data ----------
export const dummyResources: ResourceRec[] = [
  {
    id: "vid1",
    title: "Mindfulness Meditation for Beginners",
    type: "video",
    url: "https://www.youtube.com/watch?v=abcd1234",
    tags: ["meditation", "mindfulness", "relax"],
    snippet: "A short guided mindfulness meditation for beginners.",
    thumbnail: "https://img.youtube.com/vi/abcd1234/0.jpg",
  },
  {
    id: "vid2",
    title: "10-Minute Yoga Flow",
    type: "video",
    url: "https://www.youtube.com/watch?v=efgh5678",
    tags: ["yoga", "exercise", "fitness"],
    snippet: "Quick 10-minute yoga routine to energize your day.",
    thumbnail: "https://img.youtube.com/vi/efgh5678/0.jpg",
  },
  {
    id: "art1",
    title: "Understanding Stress & Anxiety",
    type: "article",
    url: "https://www.example.com/articles/stress-anxiety",
    tags: ["mental health", "stress", "anxiety"],
    snippet: "Learn simple techniques to manage stress and anxiety.",
  },
  {
    id: "aud1",
    title: "Calming Music for Focus",
    type: "audio",
    url: "https://www.example.com/audio/calm-track.mp3",
    tags: ["music", "focus", "relaxation"],
    snippet: "Listen to soft instrumental music to improve focus.",
  },
];

// Fetch content recommendations
export async function getContentRecommendations(params?: { q?: string; tags?: string[]; limit?: number }): Promise<ResourceRec[]> {
  console.log("[mockApi] fetching content recommendations, params:", params);
  await delay(300);

  let filtered = dummyResources;

  // Filter by query
  if (params?.q) {
    filtered = filtered.filter((r) => r.title.toLowerCase().includes(params.q!.toLowerCase()));
  }

  // Filter by tags
  if (params?.tags && params.tags.length > 0) {
    filtered = filtered.filter((r) => r.tags?.some((tag) => params.tags!.includes(tag)));
  }

  // Limit results
  if (params?.limit) {
    filtered = filtered.slice(0, params.limit);
  }

  console.log("[mockApi] returning content recommendations:", filtered);
  return filtered;
}

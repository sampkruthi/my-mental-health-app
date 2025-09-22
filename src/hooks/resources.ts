// hooks/resources.ts
import { useQuery } from "@tanstack/react-query";
import { getContentRecommendations, ResourceRec } from "../../services/mock_data/resources";

export function useFetchContentRec(token: string | null | undefined, params?: { q?: string; tags?: string[]; limit?: number }) {
  return useQuery<ResourceRec[], Error>({
    queryKey: ["resources", "recs", params, token],
    queryFn: async () => {
      if (!token) return [];
      const data = await getContentRecommendations(params);
      return data;
    },
    enabled: Boolean(token),
    staleTime: 60_000,
  });
}

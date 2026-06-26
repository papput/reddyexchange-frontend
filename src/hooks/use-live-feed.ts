import { useQuery } from "@tanstack/react-query";
import { fetchLiveFeed, type LiveFeedData } from "@/lib/api";

const QK = ["live-feed"] as const;

export function useLiveFeed() {
  return useQuery<LiveFeedData>({
    queryKey: QK,
    queryFn: fetchLiveFeed,
    refetchInterval: 4_000,
    staleTime: 2_000,
  });
}

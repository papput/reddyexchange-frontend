import { useQuery } from "@tanstack/react-query";
import { fetchReviewFeed } from "@/lib/api";

export function useReviewFeed() {
  return useQuery({
    queryKey: ["review-feed"],
    queryFn: fetchReviewFeed,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

import { useQuery } from "@tanstack/react-query";
import { fetchReviews } from "@/lib/api";

const REVIEWS_PER_PAGE = 15;

export function useReviews(page: number) {
  return useQuery({
    queryKey: ["reviews", page, REVIEWS_PER_PAGE],
    queryFn: () => fetchReviews(page, REVIEWS_PER_PAGE),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

export { REVIEWS_PER_PAGE };

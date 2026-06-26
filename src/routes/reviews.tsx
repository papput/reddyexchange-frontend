import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, MapPin, Quote, Star } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { REVIEWS_PER_PAGE, useReviews } from "@/hooks/use-reviews";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

type ReviewsSearch = {
  page: number;
};

export const Route = createFileRoute("/reviews")({
  validateSearch: (search: Record<string, unknown>): ReviewsSearch => {
    const raw = Number(search.page);
    return { page: Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1 };
  },
  head: () => ({
    meta: [
      { title: `Reviews — ${site.siteName}` },
      {
        name: "description",
        content: `Read verified customer reviews for ${site.siteName}. Fast, secure USDT exchange across India.`,
      },
    ],
  }),
  component: ReviewsPage,
});

function formatReviewDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

function ReviewCard({
  authorName,
  city,
  rating,
  text,
  publishedAt,
}: {
  authorName: string;
  city?: string;
  rating: number;
  text: string;
  publishedAt: string;
}) {
  return (
    <article className="glass rounded-2xl p-5 sm:p-6 border border-border/50 hover-lift hover-lift-safe card-shell relative">
      <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/15" aria-hidden />
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-foreground">{authorName}</p>
          {city ? (
            <p className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              {city}
            </p>
          ) : null}
        </div>
        <StarRow rating={rating} />
      </div>
      <p className="text-sm sm:text-base text-secondary leading-relaxed pr-6">{text}</p>
      <p className="text-xs text-muted-foreground mt-4 tabular-nums">{formatReviewDate(publishedAt)}</p>
    </article>
  );
}

function ReviewsPage() {
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data, isLoading, isError, isFetching } = useReviews(page);

  const reviews = data?.reviews ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1;

  const goToPage = (next: number) => {
    const clamped = Math.min(Math.max(1, next), totalPages);
    navigate({ search: { page: clamped } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10 sm:py-14 max-w-3xl">
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/25 text-xs font-bold uppercase tracking-widest text-accent mb-4">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            Customer reviews
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Trusted by users <span className="gradient-text">across India</span>
          </h1>
          <p className="text-secondary mt-3 text-sm sm:text-base max-w-lg mx-auto">
            Real feedback from verified customers. New reviews are added daily — rolling 12-day window.
          </p>
          {pagination ? (
            <p className="text-xs text-muted-foreground mt-2 tabular-nums">
              {pagination.total.toLocaleString("en-IN")} reviews · {REVIEWS_PER_PAGE} per page
            </p>
          ) : null}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-secondary text-sm gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading reviews…
          </div>
        ) : isError ? (
          <div className="glass rounded-2xl p-10 text-center text-sm text-destructive">
            Could not load reviews. Please refresh and try again.
          </div>
        ) : reviews.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-secondary text-sm">
            No reviews yet. Check back soon.
          </div>
        ) : (
          <div className={cn("space-y-3 sm:space-y-4", isFetching && "opacity-70 transition-opacity")}>
            {reviews.map((r) => (
              <ReviewCard key={r.id} {...r} />
            ))}
          </div>
        )}

        {totalPages > 1 && pagination ? (
          <div className="mt-10 flex flex-col items-center gap-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) goToPage(page - 1);
                    }}
                    className={page <= 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev !== undefined && p - prev > 1;
                    return (
                      <span key={p} className="contents">
                        {showEllipsis ? (
                          <PaginationItem>
                            <span className="px-2 text-muted-foreground">…</span>
                          </PaginationItem>
                        ) : null}
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            isActive={p === page}
                            onClick={(e) => {
                              e.preventDefault();
                              goToPage(p);
                            }}
                            className="cursor-pointer"
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      </span>
                    );
                  })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) goToPage(page + 1);
                    }}
                    className={page >= totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <p className="text-xs text-muted-foreground tabular-nums">
              Page {page} of {totalPages}
            </p>
          </div>
        ) : null}

        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="glass border-border/60">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

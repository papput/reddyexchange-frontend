import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Quote, Star } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useReviewFeed } from "@/hooks/use-review-feed";
import { useReviews } from "@/hooks/use-reviews";
import { ReviewSubmitDialog } from "@/components/site/ReviewSubmitDialog";
import { MyReviewDialog } from "@/components/site/MyReviewDialog";
import type { ReviewFeedEntry, ReviewItem } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { cn } from "@/lib/utils";

function formatReviewDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "h-4 w-4" : "h-3 w-3";
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(cls, i < rating ? "fill-warning text-warning" : "text-muted-foreground/30")}
        />
      ))}
    </div>
  );
}

function ReviewSlideCard({ review }: { review: ReviewFeedEntry | ReviewItem }) {
  return (
    <article className="site-card rounded-[16px] p-4 sm:p-5 h-full min-h-[148px] sm:min-h-[160px] flex flex-col">
      <Quote className="absolute hidden" aria-hidden />
      <div className="flex items-start justify-between gap-3 mb-2 sm:mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-[10px] sm:text-xs shrink-0">
            {initials(review.authorName)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{review.authorName}</p>
            <StarRow rating={review.rating} />
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
          {formatReviewDate(review.publishedAt)}
        </span>
      </div>
      <p className="text-xs sm:text-sm text-secondary leading-relaxed line-clamp-4 flex-1">{review.text}</p>
    </article>
  );
}

function randomSlideMs() {
  return 2000 + Math.floor(Math.random() * 1000);
}

export function HomeReviewsSection() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const { data: feed, isLoading, isError } = useReviewFeed();
  const { data: listData } = useReviews(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewReview, setViewReview] = useState<ReviewItem | null>(null);
  const [animating, setAnimating] = useState(false);

  const publicSlides = feed?.entries ?? [];
  const myPending = feed?.myReview ?? null;
  const totalApproved = listData?.pagination?.total ?? feed?.poolSize ?? 0;

  const slides = useMemo(() => {
    if (myPending && auth?.token) {
      return [myPending, ...publicSlides];
    }
    return publicSlides;
  }, [myPending, publicSlides, auth?.token]);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setAnimating(true);
      window.setTimeout(() => {
        setActiveIndex((i) => (i + 1) % slides.length);
        setAnimating(false);
      }, 280);
      timer = setTimeout(tick, randomSlideMs());
    };
    timer = setTimeout(tick, randomSlideMs());
    return () => clearTimeout(timer);
  }, [slides.length]);

  useEffect(() => {
    setActiveIndex(0);
  }, [slides.length, myPending?.id]);

  const current = slides[activeIndex];
  const myReviewToShow = viewReview ?? myPending;

  const openViewReview = (review?: ReviewItem | null) => {
    const target = review ?? myPending;
    if (!target) return;
    setViewReview(target);
    setViewDialogOpen(true);
  };

  const refreshReviews = () => {
    queryClient.invalidateQueries({ queryKey: ["review-feed"] });
    queryClient.invalidateQueries({ queryKey: ["reviews"] });
  };

  return (
    <section
      className="container mx-auto px-3 sm:px-4 pt-4 sm:pt-8 pb-4 sm:pb-8 scroll-mt-24 max-w-lg sm:max-w-xl"
      id="reviews"
    >
      <div className="site-panel p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-widest text-primary font-bold mb-1">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              Customer reviews
            </div>
            <h2 className="font-display text-[17px] sm:text-xl font-semibold text-foreground tracking-tight">
              What our users say
            </h2>
          </div>
          <span className="text-[11px] text-muted-foreground bg-muted border border-border px-2.5 py-1 rounded-full shrink-0 tabular-nums">
            {Math.min(15, slides.length)} live
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : isError || slides.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">Reviews unavailable right now.</p>
        ) : (
          <div className="relative overflow-hidden">
            <div
              className={cn(
                "transition-all duration-300 ease-out",
                animating ? "opacity-0 translate-x-6" : "opacity-100 translate-x-0",
              )}
            >
              {current ? <ReviewSlideCard review={current} /> : null}
            </div>
            {slides.length > 1 ? (
              <div className="flex justify-center gap-1.5 mt-3">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`Go to review ${i + 1}`}
                    onClick={() => setActiveIndex(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === activeIndex ? "w-5 bg-primary" : "w-1.5 bg-[#444]",
                    )}
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-[#252525]">
          <p className="text-[11px] sm:text-xs text-muted-foreground text-center sm:text-left">
            {totalApproved > 0
              ? `${totalApproved.toLocaleString("en-IN")}+ verified reviews`
              : "New reviews every 40–60 min"}
          </p>
          <div className="flex items-center gap-3">
            {myPending && auth?.token ? (
              <button
                type="button"
                onClick={() => openViewReview()}
                className="text-xs sm:text-sm font-semibold text-primary hover:underline"
              >
                View my review
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="text-xs sm:text-sm font-semibold text-primary hover:underline"
              >
                Write a review
              </button>
            )}
            <Link to="/reviews" className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground">
              See all →
            </Link>
          </div>
        </div>
      </div>

      <ReviewSubmitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmitted={(review) => {
          refreshReviews();
          openViewReview(review);
        }}
      />

      <MyReviewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        review={myReviewToShow}
        onDeleted={() => {
          setViewReview(null);
          refreshReviews();
        }}
      />
    </section>
  );
}

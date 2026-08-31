import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { submitReview, type ReviewItem } from "@/lib/api";
import { site } from "@/config/site";
import { useAuth } from "@/lib/store";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: (review: ReviewItem) => void;
};

export function ReviewSubmitDialog({ open, onOpenChange, onSubmitted }: Props) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setRating(5);
      setText("");
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!auth?.token) {
      navigate({ to: "/login" });
      return;
    }
    const trimmed = text.trim();
    if (trimmed.length < 10) {
      toast.error("Please write at least 10 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const review = await submitReview({ rating, text: trimmed });
      toast.success("Thanks! Your review has been posted.", {
        action: {
          label: "View review",
          onClick: () => onSubmitted?.(review),
        },
      });
      onSubmitted?.(review);
      handleOpenChange(false);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg || "Could not submit review. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!auth?.token && open) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to review</DialogTitle>
            <DialogDescription>
              Create an account or log in to share your experience with {site.siteName}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" asChild>
              <Link to="/register">Register</Link>
            </Button>
            <Button asChild className="gradient-primary border-0">
              <Link to="/login">Login</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a review</DialogTitle>
          <DialogDescription>Share your experience — it will appear in your reviews feed right away.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <p className="text-sm font-medium mb-2">Your rating</p>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className="p-0.5 rounded"
                  aria-label={`${i + 1} stars`}
                >
                  <Star
                    className={cn(
                      "h-7 w-7 transition-colors",
                      i < rating ? "fill-warning text-warning" : "text-muted-foreground/35",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Your experience</p>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell us about your exchange experience…"
              maxLength={500}
              rows={4}
              className="resize-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1 tabular-nums">{text.length}/500</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || text.trim().length < 10}
            className="gradient-primary border-0"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

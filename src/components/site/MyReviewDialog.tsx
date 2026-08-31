import { useState } from "react";
import { Loader2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteMyReview, type ReviewItem } from "@/lib/api";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: ReviewItem | null;
  onDeleted?: () => void;
};

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

export function MyReviewDialog({ open, onOpenChange, review, onDeleted }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMyReview();
      toast.success("Your review has been deleted.");
      setConfirmOpen(false);
      onOpenChange(false);
      onDeleted?.();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg || "Could not delete review. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (!review) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your review</DialogTitle>
            <DialogDescription>This is how your review appears in the feed.</DialogDescription>
          </DialogHeader>
          <article className="site-card rounded-[16px] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
                  {initials(review.authorName)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{review.authorName}</p>
                  <div className="flex items-center gap-0.5 mt-0.5" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          i < review.rating ? "fill-warning text-warning" : "text-muted-foreground/30",
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                {formatReviewDate(review.publishedAt)}
              </span>
            </div>
            <p className="text-sm text-secondary leading-relaxed">{review.text}</p>
          </article>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete review
            </Button>
            <Button type="button" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your review?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your review permanently. You can submit a new one anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

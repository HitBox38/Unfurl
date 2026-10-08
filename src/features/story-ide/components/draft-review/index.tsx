import { draftChanges, canApplyDraft } from "@/features/story-ide/draft";
import { DraftReviewContent } from "@/features/story-ide/components/draft-review-content";
import type { DraftReviewProps } from "@/features/story-ide/components/draft-review/types";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

export const DraftReview = ({
  open,
  onOpenChange,
  saved,
  result,
  error,
  onApply,
  onResolve,
}: DraftReviewProps) => {
  const changes = result.story ? draftChanges(saved, result.story) : [];
  const changed = changes.length > 0 || result.story?.start !== saved.start;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85svh] flex-col sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Review story fix</DialogTitle>
          <DialogDescription>
            Review the complete fix before applying it. All changes will be
            saved together as one undoable action.
          </DialogDescription>
        </DialogHeader>
        <DraftReviewContent
          saved={saved}
          result={result}
          error={error}
          onResolve={onResolve}
        />
        <DialogFooter className="shrink-0 border-t pt-4">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Keep editing
          </Button>
          <Button
            disabled={!canApplyDraft(result) || !changed}
            onClick={onApply}
          >
            Apply complete fix
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

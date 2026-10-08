import type { DraftResult } from "@/features/story-ide/types";
import type { StoryData } from "@/shared/types";

export interface DraftReviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saved: StoryData;
  result: DraftResult;
  error: string | null;
  onApply: () => void;
  onResolve: (id: string, resolution: "saved" | "draft") => void;
}

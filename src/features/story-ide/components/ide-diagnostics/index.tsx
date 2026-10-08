import { CircleAlert } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";
import { displayPath } from "@/features/story-ide/search";
import type { StoryIdeController } from "@/features/story-ide/hooks/use-story-ide-controller";

export const IdeDiagnostics = ({ ide }: { ide: StoryIdeController }) => {
  const { errors, warnings, result, select, setReviewOpen } = ide;
  return (
    <section className="shrink-0 border-t" aria-label="Story diagnostics">
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
        <span className="flex items-center gap-2 font-medium">
          <CircleAlert className="size-3.5" />
          Diagnostics
        </span>
        <span className="text-muted-foreground">
          {errors} errors · {warnings} warnings · {result.conflicts.length}{" "}
          conflicts
        </span>
      </div>
      {result.issues.length || result.conflicts.length ? (
        <div className="max-h-28 overflow-auto px-3 pb-2">
          {result.issues.map((issue, index) => (
            <button
              key={index}
              className={cn(
                "block w-full py-1 text-left text-xs hover:underline",
                issue.severity === "error"
                  ? "text-destructive"
                  : "text-muted-foreground",
              )}
              onClick={() => {
                if (issue.documentId) select(issue.documentId, issue.path);
              }}
            >
              {displayPath(issue.path)} · {issue.message}
            </button>
          ))}
          {result.conflicts.length ? (
            <Button
              variant="link"
              size="sm"
              className="h-auto px-0 py-1 text-xs"
              onClick={() => setReviewOpen(true)}
            >
              Resolve saved-story conflicts in Review fix
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="px-3 pb-2 text-xs text-muted-foreground">
          No structural problems found. Verify game behavior with an exported
          test copy.
        </p>
      )}
    </section>
  );
};

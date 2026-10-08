import type { MergeConflict } from "@/features/story-ide/types";
import type { DraftReviewProps } from "@/features/story-ide/components/draft-review/types";
import { showValue } from "@/features/story-ide/components/draft-review/helpers";
import { displayPath } from "@/features/story-ide/search";
import { Button } from "@/shared/ui/button";

export const DraftConflict = ({
  conflict,
  onResolve,
}: {
  conflict: MergeConflict;
  onResolve: DraftReviewProps["onResolve"];
}) => (
  <section
    key={conflict.id}
    className="space-y-3 rounded-xl border border-warning/50 p-4"
  >
    <h3 className="text-sm font-medium">
      Resolve conflict · {conflict.nodeName} · {displayPath(conflict.path)}
    </h3>
    <div className="grid gap-3 sm:grid-cols-3">
      {(
        [
          ["Original", conflict.original],
          ["Saved", conflict.saved],
          ["Draft", conflict.draft],
        ] as const
      ).map(([label, value]) => (
        <div key={label} className="min-w-0 rounded-lg bg-muted p-3">
          <p className="mb-2 text-xs text-muted-foreground">{label}</p>
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all text-xs">
            {showValue(value)}
          </pre>
        </div>
      ))}
    </div>
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => onResolve(conflict.id, "saved")}
      >
        Use saved value
      </Button>
      <Button size="sm" onClick={() => onResolve(conflict.id, "draft")}>
        Use draft value
      </Button>
    </div>
  </section>
);

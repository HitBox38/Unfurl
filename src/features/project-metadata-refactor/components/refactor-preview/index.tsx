import type { MetadataRefactorPlan } from "@/shared/lib/project-metadata-refactor";
import { RefactorChanges } from "@/features/project-metadata-refactor/components/refactor-changes";

interface RefactorPreviewProps {
  plan: MetadataRefactorPlan;
  visibleChanges: number;
  onShowMore: () => void;
}
export const RefactorPreview = ({
  plan,
  visibleChanges,
  onShowMore,
}: RefactorPreviewProps) => (
  <>
    <p className="text-sm font-medium">
      {plan.changes.length} value changes ·{" "}
      {
        new Set(plan.changes.map((change) => change.nodeName + change.fileId))
          .size
      }{" "}
      nodes · {new Set(plan.changes.map((change) => change.fileId)).size}{" "}
      stories
    </p>
    <p className="text-xs text-muted-foreground">
      {plan.undoAvailable
        ? "Undo is available for seven days, provided no later saved edits would be overwritten."
        : "This refactor is too large to keep an undo snapshot within the 512 KB limit. Export your stories and metadata definitions before applying."}
    </p>
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="min-w-0 rounded-xl border p-3">
        <h3 className="mb-2 text-xs text-muted-foreground">
          Saved definitions
        </h3>
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all text-xs">
          {JSON.stringify(plan.baseConfig, null, 2)}
        </pre>
      </div>
      <div className="min-w-0 rounded-xl border p-3">
        <h3 className="mb-2 text-xs text-muted-foreground">After refactor</h3>
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all text-xs">
          {JSON.stringify(plan.nextConfig, null, 2)}
        </pre>
      </div>
    </div>
    {plan.errors.map((entry, index) => (
      <p key={index} role="alert" className="text-sm text-destructive">
        {entry}
      </p>
    ))}
    <RefactorChanges
      plan={plan}
      visibleChanges={visibleChanges}
      onShowMore={onShowMore}
    />
  </>
);

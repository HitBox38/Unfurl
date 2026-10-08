import { draftChanges } from "@/features/story-ide/draft";
import { DraftConflict } from "@/features/story-ide/components/draft-conflict";
import { NodeChange } from "@/features/story-ide/components/node-change";
import type { DraftReviewProps } from "@/features/story-ide/components/draft-review/types";

export const DraftReviewContent = ({
  saved,
  result,
  error,
  onResolve,
}: Pick<DraftReviewProps, "saved" | "result" | "error" | "onResolve">) => {
  const changes = result.story ? draftChanges(saved, result.story) : [];
  return (
    <div className="min-h-0 space-y-4 overflow-auto text-left">
      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      {result.conflicts.map((conflict) => (
        <DraftConflict
          key={conflict.id}
          conflict={conflict}
          onResolve={onResolve}
        />
      ))}
      {result.issues.length ? (
        <ul className="space-y-1 rounded-xl bg-muted p-3 text-sm">
          {result.issues.map((issue, index) => (
            <li
              key={index}
              className={
                issue.severity === "error"
                  ? "text-destructive"
                  : "text-muted-foreground"
              }
            >
              {issue.severity === "error" ? "Error" : "Warning"}:{" "}
              {issue.message}
            </li>
          ))}
        </ul>
      ) : null}
      {result.story && result.story.start !== saved.start ? (
        <p className="rounded-xl border p-3 text-sm">
          Start node:{" "}
          <span className="font-mono">{saved.start ?? "(none)"}</span> →{" "}
          <span className="font-mono">{result.story.start ?? "(none)"}</span>
        </p>
      ) : null}
      {changes.length ? (
        changes.map(({ key, ...change }) => (
          <NodeChange key={key} {...change} />
        ))
      ) : (
        <p className="py-6 text-sm text-muted-foreground">
          {result.story
            ? "No node changes to apply."
            : "Resolve the JSON errors to compare your changes."}
        </p>
      )}
    </div>
  );
};

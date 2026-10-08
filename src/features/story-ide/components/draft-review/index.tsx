import { useState } from "react";

import { draftChanges, canApplyDraft } from "@/features/story-ide/draft";
import { displayPath } from "@/features/story-ide/search";
import type { DraftResult } from "@/features/story-ide/types";
import type { StoryData, StoryNode } from "@/shared/types";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";

const showValue = (value: unknown) => value === undefined ? "(removed)" : JSON.stringify(value, null, 2);

const NodeChange = ({ name, before, after }: { name: string; before?: StoryNode; after?: StoryNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <section className="overflow-hidden rounded-xl border">
      <Button variant="ghost" className="h-auto w-full justify-between rounded-none px-4 py-3 text-left" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="min-w-0 truncate font-mono text-sm">{name}</span>
        <span className="ml-2 text-xs text-muted-foreground">{!before ? "Added" : !after ? "Removed" : "Changed"} · {open ? "Hide" : "Compare"}</span>
      </Button>
      {open ? (
        <div className="grid gap-px border-t bg-border sm:grid-cols-2">
          <div className="min-w-0 bg-card p-3"><p className="mb-2 text-xs font-medium text-muted-foreground">Saved</p><pre className="max-h-72 overflow-auto whitespace-pre-wrap break-all font-mono text-xs">{showValue(before)}</pre></div>
          <div className="min-w-0 bg-card p-3"><p className="mb-2 text-xs font-medium text-muted-foreground">After applying</p><pre className="max-h-72 overflow-auto whitespace-pre-wrap break-all font-mono text-xs">{showValue(after)}</pre></div>
        </div>
      ) : null}
    </section>
  );
};

interface DraftReviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saved: StoryData;
  result: DraftResult;
  error: string | null;
  onApply: () => void;
  onResolve: (id: string, resolution: "saved" | "draft") => void;
}

export const DraftReview = ({ open, onOpenChange, saved, result, error, onApply, onResolve }: DraftReviewProps) => {
  const changes = result.story ? draftChanges(saved, result.story) : [];
  const changed = changes.length > 0 || result.story?.start !== saved.start;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85svh] flex-col sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Review story fix</DialogTitle>
          <DialogDescription>Review the complete fix before applying it. All changes will be saved together as one undoable action.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 space-y-4 overflow-auto text-left">
          {error ? <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
          {result.conflicts.map((conflict) => (
            <section key={conflict.id} className="space-y-3 rounded-xl border border-warning/50 p-4">
              <h3 className="text-sm font-medium">Resolve conflict · {conflict.nodeName} · {displayPath(conflict.path)}</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {([['Original', conflict.original], ['Saved', conflict.saved], ['Draft', conflict.draft]] as const).map(([label, value]) => (
                  <div key={label} className="min-w-0 rounded-lg bg-muted p-3"><p className="mb-2 text-xs text-muted-foreground">{label}</p><pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all text-xs">{showValue(value)}</pre></div>
                ))}
              </div>
              <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => onResolve(conflict.id, "saved")}>Use saved value</Button><Button size="sm" onClick={() => onResolve(conflict.id, "draft")}>Use draft value</Button></div>
            </section>
          ))}
          {result.issues.length ? (
            <ul className="space-y-1 rounded-xl bg-muted p-3 text-sm">
              {result.issues.map((issue, index) => <li key={index} className={issue.severity === "error" ? "text-destructive" : "text-muted-foreground"}>{issue.severity === "error" ? "Error" : "Warning"}: {issue.message}</li>)}
            </ul>
          ) : null}
          {result.story && result.story.start !== saved.start ? <p className="rounded-xl border p-3 text-sm">Start node: <span className="font-mono">{saved.start ?? "(none)"}</span> → <span className="font-mono">{result.story.start ?? "(none)"}</span></p> : null}
          {changes.length ? changes.map(({ key, ...change }) => <NodeChange key={key} {...change} />) : <p className="py-6 text-sm text-muted-foreground">{result.story ? "No node changes to apply." : "Resolve the JSON errors to compare your changes."}</p>}
        </div>
        <DialogFooter className="shrink-0 border-t pt-4">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Keep editing</Button>
          <Button disabled={!canApplyDraft(result) || !changed} onClick={onApply}>Apply complete fix</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

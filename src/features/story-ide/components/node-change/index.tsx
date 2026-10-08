import { useState } from "react";

import type { StoryNode } from "@/shared/types";
import { Button } from "@/shared/ui/button";
import { showValue } from "@/features/story-ide/components/draft-review/helpers";

export const NodeChange = ({
  name,
  before,
  after,
}: {
  name: string;
  before?: StoryNode;
  after?: StoryNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <section className="overflow-hidden rounded-xl border">
      <Button
        variant="ghost"
        className="h-auto w-full justify-between rounded-none px-4 py-3 text-left"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="min-w-0 truncate font-mono text-sm">{name}</span>
        <span className="ml-2 text-xs text-muted-foreground">
          {!before ? "Added" : !after ? "Removed" : "Changed"} ·{" "}
          {open ? "Hide" : "Compare"}
        </span>
      </Button>
      {open ? (
        <div className="grid gap-px border-t bg-border sm:grid-cols-2">
          <div className="min-w-0 bg-card p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Saved
            </p>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-all font-mono text-xs">
              {showValue(before)}
            </pre>
          </div>
          <div className="min-w-0 bg-card p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              After applying
            </p>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-all font-mono text-xs">
              {showValue(after)}
            </pre>
          </div>
        </div>
      ) : null}
    </section>
  );
};

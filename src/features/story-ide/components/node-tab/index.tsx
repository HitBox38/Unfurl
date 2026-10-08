import { X } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { valuesEqual } from "@/features/story-ide/merge";
import type { StoryIdeController } from "@/features/story-ide/hooks/use-story-ide-controller";

export const NodeTab = ({
  ide,
  id,
  index,
}: {
  ide: StoryIdeController;
  id: string;
  index: number;
}) => {
  const { workspace, result, select, actions, fileId } = ide;
  const document = workspace.documents.find((entry) => entry.id === id);
  if (!document) return null;
  const node = result.nodesByDocument.get(id);
  const name =
    node?.name ?? document.lastName ?? document.originalName ?? "New node";
  const dirty =
    document.deleted ||
    !valuesEqual(
      node,
      workspace.base.nodes.find(
        (entry) => entry.name === document.originalName,
      ),
    );
  return (
    <div
      key={id}
      className={cn(
        "flex shrink-0 items-center border-r",
        workspace.activeId === id && "bg-card",
      )}
    >
      <button
        id={`ide-tab-${id}`}
        role="tab"
        aria-selected={workspace.activeId === id}
        aria-controls="node-json-panel"
        tabIndex={workspace.activeId === id ? 0 : -1}
        className="flex max-w-52 items-center gap-2 px-3 py-3 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => select(id)}
        onKeyDown={(event) => {
          let next: string | undefined;
          if (event.key === "ArrowRight")
            next = workspace.tabs[(index + 1) % workspace.tabs.length];
          else if (event.key === "ArrowLeft")
            next =
              workspace.tabs[
                (index - 1 + workspace.tabs.length) % workspace.tabs.length
              ];
          else if (event.key === "Home") next = workspace.tabs[0];
          else if (event.key === "End") next = workspace.tabs.at(-1);
          if (next) {
            event.preventDefault();
            select(next);
            window.document.getElementById(`ide-tab-${next}`)?.focus();
          }
        }}
      >
        <span className={cn("truncate", document.deleted && "line-through")}>
          {name}
        </span>
        {dirty ? (
          <span
            className="size-1.5 shrink-0 rounded-full bg-chart-2"
            aria-label="Pending changes"
          />
        ) : null}
      </button>
      <Button
        variant="ghost"
        size="icon-xs"
        className="mr-1 shrink-0"
        aria-label={`Close tab ${name}`}
        onClick={() => actions.closeTab(fileId, id)}
      >
        <X className="size-3" />
      </Button>
    </div>
  );
};

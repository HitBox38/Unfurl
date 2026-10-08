import { X } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { TabsTrigger } from "@/shared/ui/tabs";
import { valuesEqual } from "@/features/story-ide/merge";
import type { StoryIdeController } from "@/features/story-ide/hooks/use-story-ide-controller";

export const NodeTab = ({
  ide,
  id,
}: {
  ide: StoryIdeController;
  id: string;
}) => {
  const { workspace, result, actions, fileId } = ide;
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
      className={cn(
        "flex shrink-0 items-center rounded-xl pr-1",
        workspace.activeId === id && "bg-secondary",
      )}
    >
      <TabsTrigger
        value={id}
        className="h-8 max-w-52 flex-none justify-start gap-2 rounded-xl px-3 font-mono text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
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
      </TabsTrigger>
      <Button
        variant="ghost"
        size="icon-xs"
        className="mr-1 shrink-0"
        aria-label={`Close tab ${name}`}
        onClick={(event) => {
          const list = event.currentTarget.closest('[role="tablist"]');
          const addNode = list
            ?.closest('[aria-label="Story IDE"]')
            ?.querySelector<HTMLButtonElement>('[aria-label="Add draft node"]');
          actions.closeTab(fileId, id);
          requestAnimationFrame(() => {
            const activeTab = list?.querySelector<HTMLButtonElement>(
              '[role="tab"][data-state="active"]',
            );
            (activeTab ?? addNode)?.focus();
          });
        }}
      >
        <X className="size-3" />
      </Button>
    </div>
  );
};

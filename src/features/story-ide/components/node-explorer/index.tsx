import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { valuesEqual } from "@/features/story-ide/merge";
import type { StoryIdeController } from "@/features/story-ide/hooks/use-story-ide-controller";

export const NodeExplorer = ({ ide }: { ide: StoryIdeController }) => {
  const { workspace, result, select } = ide;
  return (
    <div
      className="min-h-0 flex-1 overflow-auto p-2"
      aria-label="Node explorer"
    >
      {workspace.documents.map((document) => {
        const node = result.nodesByDocument.get(document.id);
        const name =
          node?.name ??
          document.lastName ??
          document.originalName ??
          "New node";
        const original = workspace.base.nodes.find(
          (entry) => entry.name === document.originalName,
        );
        const dirty = document.deleted || !valuesEqual(node, original);
        return (
          <Button
            key={document.id}
            variant="ghost"
            className={cn(
              "mb-0.5 h-auto w-full justify-between gap-2 px-2 py-2 text-left",
              document.id === workspace.activeId && "bg-accent",
              document.deleted && "text-muted-foreground line-through",
            )}
            onClick={() => select(document.id)}
          >
            <span className="min-w-0 truncate font-mono text-xs">{name}</span>
            {dirty ? (
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {document.deleted ? "removed" : "draft"}
              </span>
            ) : null}
          </Button>
        );
      })}
      {!workspace.documents.length ? (
        <p className="p-2 text-xs text-muted-foreground">
          Add a node to begin editing.
        </p>
      ) : null}
    </div>
  );
};

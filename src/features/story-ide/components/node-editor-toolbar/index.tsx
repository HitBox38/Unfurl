import { Trash2 } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { serializeNode } from "@/features/story-ide/draft";
import type { StoryIdeController } from "@/features/story-ide/hooks/use-story-ide-controller";

export const NodeEditorToolbar = ({ ide }: { ide: StoryIdeController }) => {
  const { activeDocument, activeNode, actions, fileId } = ide;
  return (
    <>
      {activeDocument ? (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
          <p className="min-w-0 truncate text-xs text-muted-foreground">
            {activeDocument.deleted
              ? "Node staged for removal"
              : `${activeNode?.name ?? activeDocument.originalName ?? "Node"}.json`}
          </p>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={!activeNode || activeDocument.deleted}
              onClick={() =>
                actions.editDocument(
                  fileId,
                  activeDocument.id,
                  serializeNode(activeNode!),
                )
              }
            >
              Format JSON
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => actions.deleteNode(fileId, activeDocument.id)}
            >
              {activeDocument.deleted ? (
                "Restore node"
              ) : (
                <>
                  <Trash2 className="size-3.5" />
                  Remove node
                </>
              )}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
};

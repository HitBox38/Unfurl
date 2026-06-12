import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { useCallback, type MouseEvent } from "react";

import { cn } from "@/shared/lib";
import { useJsonDataStore, useNodeStore } from "@/shared/stores";
import { Button } from "@/shared/ui/button";

import { useDialogViewerUiStore } from "../hooks/use-dialog-viewer-ui-store";
import type { DialogNodeData } from "../types";

export const DialogFlowNode = ({
  id,
  data,
}: NodeProps<Node<DialogNodeData>>) => {
  const isDeleteMode = useDialogViewerUiStore((state) => state.isDeleteMode);
  const removeNode = useJsonDataStore((state) => state.removeNode);
  const { node, previewNodeName, previewEdgeId, setNode, setGraphPreview } = useNodeStore();

  const isSelected = data.highlight === "selected";
  const isPreview = data.highlight === "preview";
  const isConnected = data.highlight === "connected";

  const onDeleteNode = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      removeNode(id);

      if (node?.name === id) {
        setNode(null);
      }
      const previewTargetsDeletedNode =
        previewNodeName === id ||
        (previewEdgeId != null &&
          (previewEdgeId.startsWith(`e${id}-`) ||
            previewEdgeId.includes(`-${id}-`)));
      if (previewTargetsDeletedNode) {
        setGraphPreview(null);
      }
    },
    [
      id,
      previewEdgeId,
      previewNodeName,
      removeNode,
      node?.name,
      setGraphPreview,
      setNode,
    ],
  );

  return (
    <div className="relative">
      {isDeleteMode ? (
        <Button
          type="button"
          variant="destructive"
          size="icon-xs"
          aria-label={`Delete node ${id}`}
          className="absolute right-1 top-1 z-10"
          onClick={onDeleteNode}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      ) : null}
      <div
        className={cn(
          "min-w-38 rounded-xl border border-border/80 bg-card/95 px-4 py-2.5 text-left text-sm font-medium text-card-foreground shadow-md backdrop-blur-sm transition-[border-color,box-shadow,transform]",
          isConnected && "border-primary/40 shadow-lg",
          isSelected &&
          "border-primary shadow-[0_0_0_1px_var(--primary),0_8px_24px_-8px_color-mix(in_oklch,var(--primary)_40%,transparent)]",
          isPreview &&
          "scale-[1.03] border-chart-2 shadow-[0_0_0_1px_var(--chart-2),0_10px_28px_-8px_color-mix(in_oklch,var(--chart-2)_55%,transparent)]",
        )}
      >
        <Handle
          className="size-2.5! border-background! bg-primary!"
          type="target"
          position={Position.Top}
        />
        <span className="block max-w-[180px] truncate">{data.label}</span>
        <Handle
          className="size-2.5! border-background! bg-primary!"
          type="source"
          position={Position.Bottom}
        />
      </div>
    </div>
  );
};

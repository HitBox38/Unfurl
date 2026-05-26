import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

import { cn } from "@/shared/lib";
import type { DialogNodeData } from "@/features/dialog-viewer/dialog-graph";

export const DialogFlowNode = ({
  data,
}: NodeProps<Node<DialogNodeData>>) => {
  const isSelected = data.highlight === "selected";
  const isPreview = data.highlight === "preview";
  const isConnected = data.highlight === "connected";

  return (
    <div
      className={cn(
        "min-w-[9.5rem] rounded-xl border border-border/80 bg-card/95 px-4 py-2.5 text-left text-sm font-medium text-card-foreground shadow-md backdrop-blur-sm transition-[border-color,box-shadow,transform]",
        isConnected && "border-primary/40 shadow-lg",
        isSelected &&
          "border-primary shadow-[0_0_0_1px_var(--primary),0_8px_24px_-8px_color-mix(in_oklch,var(--primary)_40%,transparent)]",
        isPreview &&
          "scale-[1.03] border-chart-2 shadow-[0_0_0_1px_var(--chart-2),0_10px_28px_-8px_color-mix(in_oklch,var(--chart-2)_55%,transparent)]",
      )}
    >
      <Handle
        className="!size-2.5 !border-background !bg-primary"
        type="target"
        position={Position.Top}
      />
      <span className="block max-w-[180px] truncate">{data.label}</span>
      <Handle
        className="!size-2.5 !border-background !bg-primary"
        type="source"
        position={Position.Bottom}
      />
    </div>
  );
};

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

import type { DialogNodeData } from "@/features/dialog-viewer/dialog-graph";

export const DialogFlowNode = ({
  data,
}: NodeProps<Node<DialogNodeData>>) => (
  <div className="rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-card-foreground shadow-sm">
    <Handle type="target" position={Position.Top} />
    {data.label}
    <Handle type="source" position={Position.Bottom} />
  </div>
);

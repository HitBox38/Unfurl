import { AddNodeButton } from "@/features/dialog-viewer/add-node-button";
import { DeleteModeButton } from "@/features/dialog-viewer/delete-mode-button";

export const GraphNodeToolbar = () => (
  <div className="flex items-center gap-1">
    <AddNodeButton />
    <DeleteModeButton />
  </div>
);

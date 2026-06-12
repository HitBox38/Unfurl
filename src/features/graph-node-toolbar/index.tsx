import { AddNodeButton } from "@/features/add-node-button";
import { DeleteModeButton } from "@/features/delete-mode-button";

export const GraphNodeToolbar = () => (
  <div className="flex items-center gap-1">
    <AddNodeButton />
    <DeleteModeButton />
  </div>
);

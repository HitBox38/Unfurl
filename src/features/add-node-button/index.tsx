import { Plus } from "lucide-react";
import { useCallback } from "react";

import {
  computeNewNodePosition,
  getDialogFlowInstance,
} from "@/features/dialog-viewer/helpers";
import { createStoryNode, uniqueStoryNodeName } from "@/shared/lib";
import { useJsonDataStore, useNodeStore } from "@/shared/stores";
import { Button } from "@/shared/ui/button";

export const AddNodeButton = () => {
  const content = useJsonDataStore((state) => state.content);
  const selectedNode = useNodeStore((state) => state.node);
  const startDraft = useNodeStore((state) => state.startDraft);

  const onAddNode = useCallback(() => {
    const name = uniqueStoryNodeName(content.nodes.map((node) => node.name));
    const position = computeNewNodePosition(
      content,
      selectedNode,
      getDialogFlowInstance(),
    );
    const newNode = createStoryNode(name, position);

    startDraft(newNode);
  }, [content, selectedNode, startDraft]);

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon-sm"
      aria-label="Add node"
      onClick={onAddNode}
    >
      <Plus aria-hidden="true" />
    </Button>
  );
};

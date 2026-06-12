import { Plus } from "lucide-react";
import { useCallback } from "react";

import {
  computeNewNodePosition,
  getDialogFlowInstance,
  queueDialogNodeFocus,
} from "@/features/dialog-viewer/helpers";
import {
  createStoryNode,
  uniqueStoryNodeName,
} from "@/shared/lib";
import { useJsonDataStore, useNodeStore } from "@/shared/stores";
import { Button } from "@/shared/ui/button";

export const AddNodeButton = () => {
  const content = useJsonDataStore((state) => state.content);
  const addStoryNode = useJsonDataStore((state) => state.addNode);
  const selectedNode = useNodeStore((state) => state.node);
  const setSelectedNode = useNodeStore((state) => state.setNode);

  const onAddNode = useCallback(() => {
    const name = uniqueStoryNodeName(content.nodes.map((node) => node.name));
    const position = computeNewNodePosition(
      content,
      selectedNode,
      getDialogFlowInstance(),
    );
    const newNode = createStoryNode(name, position);

    addStoryNode(newNode);
    setSelectedNode(newNode);
    queueDialogNodeFocus(name);
  }, [addStoryNode, content, selectedNode, setSelectedNode]);

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

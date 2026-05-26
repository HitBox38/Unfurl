import type { StoryData, StoryNode } from "@/shared/types";

const NEW_NODE_OFFSET_X = 160;
const NEW_NODE_OFFSET_Y = 120;

interface FlowViewportReader {
  getViewport: () => { x: number; y: number; zoom: number };
}

export const computeNewNodePosition = (
  content: StoryData,
  selectedNode: StoryNode | null,
  flowInstance: FlowViewportReader | null,
): { x: number; y: number } => {
  if (selectedNode?.position) {
    return {
      x: selectedNode.position.x,
      y: selectedNode.position.y + NEW_NODE_OFFSET_Y,
    };
  }

  const lastPositionedNode = [...content.nodes]
    .reverse()
    .find((node) => node.position);

  if (lastPositionedNode?.position) {
    return {
      x: lastPositionedNode.position.x + NEW_NODE_OFFSET_X,
      y: lastPositionedNode.position.y,
    };
  }

  if (flowInstance) {
    const viewport = flowInstance.getViewport();
    return {
      x: (-viewport.x + window.innerWidth / 2) / viewport.zoom,
      y: (-viewport.y + window.innerHeight / 2) / viewport.zoom,
    };
  }

  return {
    x: content.nodes.length * NEW_NODE_OFFSET_X,
    y: content.nodes.length * 80,
  };
};

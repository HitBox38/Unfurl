import type { Edge, Node } from "@xyflow/react";
import dagre from "dagre";

import type { StoryData, StoryNode } from "@/shared/types";

import {
  DIALOG_NODE_TYPE,
  NODE_HEIGHT,
  NODE_WIDTH,
  NEW_NODE_OFFSET_X,
  NEW_NODE_OFFSET_Y,
} from "./constants";
import type { DialogNodeData } from "./types";

export const buildChoiceEdgeId = (
  source: string,
  target: string,
  choiceIndex: number,
) => `e${source}-${target}-${choiceIndex}`;

const getNodeDimensions = (node: Node<DialogNodeData>) => ({
  width: node.data.metadata.size?.width ?? NODE_WIDTH,
  height: node.data.metadata.size?.height ?? NODE_HEIGHT,
});

const layoutDagre = (
  nodes: Node<DialogNodeData>[],
  edges: Edge[],
): Node<DialogNodeData>[] => {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({});

  nodes.forEach((node) => {
    graph.setNode(node.id, getNodeDimensions(node));
  });

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  return nodes.map((node) => {
    const positioned = graph.node(node.id);
    const { width, height } = getNodeDimensions(node);
    return {
      ...node,
      position: {
        x: positioned.x - width / 2,
        y: positioned.y - height / 2,
      },
    };
  });
};

export const buildDialogGraph = (
  json: StoryData,
): { nodes: Node<DialogNodeData>[]; edges: Edge[] } => {
  const nodes: Node<DialogNodeData>[] = json.nodes.map((node) => ({
    id: node.name,
    type: DIALOG_NODE_TYPE,
    data: { label: node.name, metadata: node },
    position: node.position ?? { x: 0, y: 0 },
  }));

  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges: Edge[] = json.nodes.flatMap((node) =>
    node.choices.flatMap((choice, choiceIndex) => {
      if (!nodeIds.has(choice.destination)) return [];
      return {
        id: buildChoiceEdgeId(node.name, choice.destination, choiceIndex),
        source: node.name,
        target: choice.destination,
      } satisfies Edge;
    }),
  );

  const hasStoredPositions = nodes.every((node) => node.data.metadata.position);
  return { nodes: hasStoredPositions ? nodes : layoutDagre(nodes, edges), edges };
};

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

interface DialogFlowViewport {
  getViewport: () => { x: number; y: number; zoom: number };
  fitView: (options: {
    nodes: Array<{ id: string }>;
    duration: number;
    padding: number;
  }) => void | Promise<boolean>;
}

let flowInstance: DialogFlowViewport | null = null;
let focusNodeName: string | null = null;

export const setDialogFlowInstance = (instance: DialogFlowViewport | null) => {
  flowInstance = instance;
};

export const getDialogFlowInstance = () => flowInstance;

export const queueDialogNodeFocus = (nodeName: string) => {
  focusNodeName = nodeName;
};

export const peekQueuedDialogNodeFocus = () => focusNodeName;

export const clearQueuedDialogNodeFocus = () => {
  focusNodeName = null;
};

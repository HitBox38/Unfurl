import type { Edge, Node } from "@xyflow/react";
import dagre from "dagre";

import type { StoryData, StoryNode } from "@/shared/types";

export interface DialogNodeData extends Record<string, unknown> {
  label: string;
  metadata: StoryNode;
}

const NODE_WIDTH = 150;
const NODE_HEIGHT = 50;

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
    data: { label: node.name, metadata: node },
    position: node.position ?? { x: 0, y: 0 },
    ...(node.size
      ? { style: { width: node.size.width, height: node.size.height } }
      : {}),
  }));

  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges: Edge[] = json.nodes.flatMap((node) =>
    node.choices.flatMap((choice, choiceIndex) => {
      if (!nodeIds.has(choice.destination)) return [];
      return {
        id: `e${node.name}-${choice.destination}-${choiceIndex}`,
        source: node.name,
        target: choice.destination,
      } satisfies Edge;
    }),
  );

  const hasStoredPositions = nodes.every((node) => node.data.metadata.position);
  return { nodes: hasStoredPositions ? nodes : layoutDagre(nodes, edges), edges };
};

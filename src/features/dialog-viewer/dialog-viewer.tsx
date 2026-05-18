import {
  ConnectionLineType,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from "@xyflow/react";
import dagre from "dagre";
import { useCallback, useMemo } from "react";

import { useJsonDataStore, useNodeStore } from "@/shared/stores";
import type { StoryData, StoryNode } from "@/shared/types";

interface DialogNodeData extends Record<string, unknown> {
  label: string;
  metadata: StoryNode;
}

const NODE_WIDTH = 150;
const NODE_HEIGHT = 50;

const layoutDagre = (
  nodes: Node<DialogNodeData>[],
  edges: Edge[],
): Node<DialogNodeData>[] => {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({});

  nodes.forEach((node) => {
    graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  return nodes.map((node) => {
    const positioned = graph.node(node.id);
    return {
      ...node,
      position: {
        x: positioned.x - NODE_WIDTH / 2,
        y: positioned.y - NODE_HEIGHT / 2,
      },
    };
  });
};

const transformJsonToNodesAndEdges = (
  json: StoryData,
): { nodes: Node<DialogNodeData>[]; edges: Edge[] } => {
  const nodes: Node<DialogNodeData>[] = json.nodes.map((node, index) => ({
    id: index.toString(),
    data: { label: node.name, metadata: node },
    position: { x: 0, y: 0 },
  }));

  const edges: Edge[] = json.nodes.flatMap((node, index) =>
    node.choices.map((choice) => {
      const targetIndex = json.nodes.findIndex(
        (n) => n.name === choice.destination,
      );
      return {
        id: `e${index}-${targetIndex}`,
        source: index.toString(),
        target: targetIndex.toString(),
      } satisfies Edge;
    }),
  );

  return { nodes: layoutDagre(nodes, edges), edges };
};

const isOnlineHost = () =>
  location.hostname.includes(".vercel.app") &&
  location.hostname.includes("unfurl");

export const DialogViewer = () => {
  const content = useJsonDataStore((state) => state.content);
  const setSelectedNode = useNodeStore((state) => state.setNode);

  const initial = useMemo(
    () => transformJsonToNodesAndEdges(content),
    [content],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<DialogNodeData>>(
    initial.nodes,
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initial.edges);

  const onLayout = useCallback(() => {
    const updated = transformJsonToNodesAndEdges(content);
    setNodes([...updated.nodes]);
    setEdges([...updated.edges]);
  }, [content, setNodes, setEdges]);

  const width = isOnlineHost() ? "100%" : "500px";

  return (
    <div
      className="mr-6 h-[750px] rounded-xl bg-[#121212] bg-[image:linear-gradient(rgba(255,255,255,0.05),rgba(255,255,255,0.05))] shadow-md transition-shadow"
      style={{ width }}
    >
      <ReactFlow
        fitView
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_e, node) => setSelectedNode(node.data.metadata)}
        connectionLineType={ConnectionLineType.Step}
        onInit={onLayout}
      />
    </div>
  );
};

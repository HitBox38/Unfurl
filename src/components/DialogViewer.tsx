import { useNodesState, useEdgesState, Node, Edge, ConnectionLineType } from "reactflow";
import "reactflow/dist/style.css";
import { UseJsonDataStore } from "../stores/JsonData";
import { StoryData } from "../interfaces/StoryData";
import { lazy, useCallback } from "react";
import { StoryNode } from "../interfaces/Node";
import dagre from "dagre";
import { UseNodeStore } from "../stores/Node";
import styled from "styled-components";
import { Box } from "@mui/material";

const ReactFlow = lazy(() => import("reactflow"));

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (elements: { nodes: Node[]; edges: Edge[] }) => {
  dagreGraph.setGraph({});
  const { nodes, edges } = elements;
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 150, height: 50 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - 150 / 2,
      y: nodeWithPosition.y - 50 / 2,
    };

    return node;
  });

  return { nodes, edges };
};

const transformJsonToNodesAndEdges = (json: StoryData) => {
  const elements: { nodes: Node[]; edges: Edge[] } = { nodes: [], edges: [] };

  // First pass: Add all nodes to dagre graph and nodes state
  json.nodes.forEach((node, index) => {
    const nodeId = index.toString();
    elements.nodes.push({
      id: nodeId,
      data: { label: node.name, metadata: node },
      position: { x: 0, y: 0 },
    });
  });

  // Second pass: Add all edges to dagre graph and edges state
  json.nodes.forEach((node, index) => {
    const nodeId = index.toString();

    node.choices.forEach((choice) => {
      const targetIndex = json.nodes.findIndex((n) => n.name === choice.destination);
      elements.edges.push({
        id: "e" + nodeId + "-" + targetIndex,
        source: nodeId,
        target: targetIndex.toString(),
      });
    });
  });

  return elements;
};

const DialogViewer = () => {
  const { content } = UseJsonDataStore((state) => state);
  console.log(content);

  const setSelectedNode = UseNodeStore(({ setNode }) => setNode);

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    transformJsonToNodesAndEdges(content)
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<{ label: string; metadata: StoryNode }>(
    layoutedNodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      transformJsonToNodesAndEdges(content)
    );
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [content, setNodes, setEdges]);

  return (
    <FlowWrapper>
      <ReactFlow
        fitView
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodes={nodes}
        edges={edges}
        onNodeClick={(_e, node) => setSelectedNode(node.data.metadata)}
        connectionLineType={ConnectionLineType.Step}
        onLoadedData={() => onLayout()}
      />
    </FlowWrapper>
  );
};

const FlowWrapper = styled(Box)`
  width: ${location.hostname.includes(".vercel.app") && location.hostname.includes("unfurl")
    ? "100%"
    : "500px"};
  margin-right: 25px;
  height: 750px;
  border: 1px solid #f6f6f6;
  border-radius: 10px;
`;

export default DialogViewer;

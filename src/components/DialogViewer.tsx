import ReactFlow, { useNodesState, useEdgesState, Node, Edge, ConnectionLineType } from "reactflow";
import { useJsonDataStore } from "../stores/JsonData";
import { StoryData } from "../interfaces/StoryData";
import { useCallback } from "react";
import { StoryNode } from "../interfaces/Node";
import dagre from "dagre";
import { UseNodeStore } from "../stores/Node";
import { Box } from "@mui/material";
import { tss } from "tss-react/mui";
import "reactflow/dist/style.css";

// const ReactFlow = lazy(() => import("reactflow"));

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
  const { content } = useJsonDataStore((state) => state);
  console.log(content);

  const setSelectedNode = UseNodeStore(({ setNode }) => setNode);

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    transformJsonToNodesAndEdges(content)
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<{ label: string; metadata: StoryNode }>(
    layoutedNodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const { classes } = useStyles();

  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      transformJsonToNodesAndEdges(content)
    );
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [content, setNodes, setEdges]);

  return (
    <Box className={classes.flowWrapper}>
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
    </Box>
  );
};

const useStyles = tss.create(() => ({
  flowWrapper: {
    width:
      location.hostname.includes(".vercel.app") && location.hostname.includes("unfurl")
        ? "100%"
        : "500px",
    marginRight: "25px",
    height: "750px",
    borderRadius: "10px",
    backgroundColor: "#121212",
    transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
    backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))",
    boxShadow:
      "0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)",
  },
}));

export default DialogViewer;

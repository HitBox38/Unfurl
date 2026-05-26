import {
  addEdge,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  type ReactFlowInstance,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { appendChoice, createChoice } from "@/shared/lib";
import { useJsonDataStore, useNodeStore } from "@/shared/stores";
import { DialogFlowNode } from "@/features/dialog-viewer/dialog-flow-node";
import {
  buildDialogGraph,
  DIALOG_NODE_TYPE,
  type DialogNodeData,
} from "@/features/dialog-viewer/dialog-graph";

const PREVIEW_NODE_CLASS =
  "dialog-node-preview ring-2 ring-primary ring-offset-2 ring-offset-background";
const SELECTED_NODE_CLASS =
  "dialog-node-selected ring-2 ring-primary/80 ring-offset-2 ring-offset-background";

export const DialogViewer = () => {
  const content = useJsonDataStore((state) => state.content);
  const setJsonNode = useJsonDataStore((state) => state.setNode);
  const selectedNode = useNodeStore((state) => state.node);
  const setSelectedNode = useNodeStore((state) => state.setNode);
  const previewNodeName = useNodeStore((state) => state.previewNodeName);
  const flowInstanceRef =
    useRef<ReactFlowInstance<Node<DialogNodeData>, Edge> | null>(null);

  const initial = useMemo(
    () => buildDialogGraph(content),
    [content],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<DialogNodeData>>(
    initial.nodes,
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initial.edges);
  const nodeTypes = useMemo(
    () =>
      ({
        [DIALOG_NODE_TYPE]: DialogFlowNode,
      }) satisfies NodeTypes,
    [],
  );
  const displayedNodes = useMemo(
    () =>
      nodes.map((node) => {
        const isPreviewed = node.id === previewNodeName;
        const isSelected = node.id === selectedNode?.name;
        const className = isPreviewed
          ? PREVIEW_NODE_CLASS
          : isSelected
            ? SELECTED_NODE_CLASS
            : undefined;

        if (!className) return node;

        return {
          ...node,
          selected: true,
          className: [node.className, className].filter(Boolean).join(" "),
        };
      }),
    [nodes, previewNodeName, selectedNode?.name],
  );

  const onLayout = useCallback(() => {
    const updated = buildDialogGraph(content);
    setNodes([...updated.nodes]);
    setEdges([...updated.edges]);
  }, [content, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const sourceNode = content.nodes.find(
        (node) => node.name === connection.source,
      );
      if (!sourceNode) return;

      const choiceIndex = sourceNode.choices.length;
      const updatedSourceNode = appendChoice(
        sourceNode,
        createChoice(connection.target),
      );

      setJsonNode(updatedSourceNode, sourceNode.name);
      if (selectedNode?.name === sourceNode.name) {
        setSelectedNode(updatedSourceNode);
      }

      setEdges((currentEdges) =>
        addEdge(
          {
            ...connection,
            id: `e${connection.source}-${connection.target}-${choiceIndex}`,
          },
          currentEdges,
        ),
      );
    },
    [content.nodes, selectedNode?.name, setEdges, setJsonNode, setSelectedNode],
  );

  useEffect(() => {
    onLayout();
  }, [onLayout]);

  useEffect(() => {
    if (!previewNodeName || !flowInstanceRef.current) return;
    if (!nodes.some((node) => node.id === previewNodeName)) return;

    void flowInstanceRef.current.fitView({
      nodes: [{ id: previewNodeName }],
      duration: 250,
      padding: 0.6,
    });
  }, [nodes, previewNodeName]);

  return (
    <div
      aria-label="Dialog flow chart"
      className="h-full w-full bg-[#121212] bg-[image:linear-gradient(rgba(255,255,255,0.05),rgba(255,255,255,0.05))]"
    >
      <ReactFlow
        fitView
        colorMode="dark"
        nodes={displayedNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_e, node) => setSelectedNode(node.data.metadata)}
        nodesConnectable
        deleteKeyCode={null}
        onInit={(instance) => {
          flowInstanceRef.current = instance;
          onLayout();
        }}
      />
    </div>
  );
};

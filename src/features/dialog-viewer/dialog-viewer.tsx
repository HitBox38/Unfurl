import {
  ConnectionLineType,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { useJsonDataStore, useNodeStore } from "@/shared/stores";
import {
  buildDialogGraph,
  type DialogNodeData,
} from "@/features/dialog-viewer/dialog-graph";

const isElectronRenderer = () =>
  typeof window !== "undefined" && Boolean(window.ipcRenderer);

const PREVIEW_NODE_CLASS =
  "dialog-node-preview ring-2 ring-primary ring-offset-2 ring-offset-background";

export const DialogViewer = () => {
  const content = useJsonDataStore((state) => state.content);
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
  const displayedNodes = useMemo(
    () =>
      nodes.map((node) =>
        node.id === previewNodeName
          ? {
              ...node,
              selected: true,
              className: [node.className, PREVIEW_NODE_CLASS]
                .filter(Boolean)
                .join(" "),
            }
          : node,
      ),
    [nodes, previewNodeName],
  );

  const onLayout = useCallback(() => {
    const updated = buildDialogGraph(content);
    setNodes([...updated.nodes]);
    setEdges([...updated.edges]);
  }, [content, setNodes, setEdges]);

  const width = isElectronRenderer() ? "500px" : "100%";

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
      className="mr-6 h-[750px] rounded-xl bg-[#121212] bg-[image:linear-gradient(rgba(255,255,255,0.05),rgba(255,255,255,0.05))] shadow-md transition-shadow"
      style={{ width }}
    >
      <ReactFlow
        fitView
        colorMode="dark"
        nodes={displayedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_e, node) => setSelectedNode(node.data.metadata)}
        connectionLineType={ConnectionLineType.Step}
        onInit={(instance) => {
          flowInstanceRef.current = instance;
          onLayout();
        }}
      />
    </div>
  );
};

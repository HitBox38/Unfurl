import {
  ConnectionLineType,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo } from "react";

import { useJsonDataStore, useNodeStore } from "@/shared/stores";
import {
  buildDialogGraph,
  type DialogNodeData,
} from "@/features/dialog-viewer/dialog-graph";

const isOnlineHost = () =>
  location.hostname.includes(".vercel.app") &&
  location.hostname.includes("unfurl");

export const DialogViewer = () => {
  const content = useJsonDataStore((state) => state.content);
  const setSelectedNode = useNodeStore((state) => state.setNode);

  const initial = useMemo(
    () => buildDialogGraph(content),
    [content],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<DialogNodeData>>(
    initial.nodes,
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initial.edges);

  const onLayout = useCallback(() => {
    const updated = buildDialogGraph(content);
    setNodes([...updated.nodes]);
    setEdges([...updated.edges]);
  }, [content, setNodes, setEdges]);

  const width = isOnlineHost() ? "100%" : "500px";

  useEffect(() => {
    onLayout();
  }, [onLayout]);

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

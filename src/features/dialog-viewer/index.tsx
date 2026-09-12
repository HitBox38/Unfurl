import {
  addEdge,
  Background,
  BackgroundVariant,
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

import { appendChoice, cn, createChoice } from "@/shared/lib";
import { useJsonDataStore, useNodeStore } from "@/shared/stores";

import { DialogFlowNode } from "./components/dialog-flow-node";
import { DIALOG_NODE_TYPE } from "./constants";
import {
  buildChoiceEdgeId,
  buildDialogGraph,
  clearQueuedDialogNodeFocus,
  getChoicePreviewFitViewPadding,
  peekQueuedDialogNodeFocus,
  setDialogFlowInstance,
} from "./helpers";
import type { DialogNodeData } from "./types";

export const DialogViewer = () => {
  const content = useJsonDataStore((state) => state.content);
  const setJsonNode = useJsonDataStore((state) => state.setNode);
  const selectedNode = useNodeStore((state) => state.node);
  const setSelectedNode = useNodeStore((state) => state.setNode);
  const previewNodeName = useNodeStore((state) => state.previewNodeName);
  const previewEdgeId = useNodeStore((state) => state.previewEdgeId);
  const flowInstanceRef =
    useRef<ReactFlowInstance<Node<DialogNodeData>, Edge> | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let previousWidth = container.clientWidth;
    let previousHeight = container.clientHeight;
    let timeout: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height || (width === previousWidth && height === previousHeight)) return;
      previousWidth = width;
      previousHeight = height;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const flow = flowInstanceRef.current;
        if (!flow) return;
        const selected = useNodeStore.getState().node;
        const nodes = selected && flow.getNode(selected.name) ? [{ id: selected.name }] : undefined;
        void flow.fitView({ nodes, padding: nodes ? 0.6 : 0.2, maxZoom: 1.2, duration: 200 });
      }, 150);
    });
    observer.observe(container);
    return () => { observer.disconnect(); clearTimeout(timeout); };
  }, []);

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
  const displayedNodes = useMemo<Node<DialogNodeData>[]>(
    () => {
      const connectedNodeIds = new Set<string>();
      if (selectedNode) {
        edges.forEach((edge) => {
          if (
            edge.source !== selectedNode.name &&
            edge.target !== selectedNode.name
          ) {
            return;
          }

          connectedNodeIds.add(edge.source);
          connectedNodeIds.add(edge.target);
        });
      }

      return nodes.map((node) => {
        const isPreviewed = node.id === previewNodeName;
        const isSelected = node.id === selectedNode?.name;
        const isConnected = connectedNodeIds.has(node.id);
        let highlight: DialogNodeData["highlight"];
        if (isPreviewed) {
          highlight = "preview";
        } else if (isSelected) {
          highlight = "selected";
        } else if (isConnected) {
          highlight = "connected";
        }

        return {
          ...node,
          selected: isSelected,
          data: { ...node.data, highlight },
        };
      });
    },
    [edges, nodes, previewNodeName, selectedNode],
  );
  const displayedEdges = useMemo<Edge[]>(
    () =>
      edges.map((edge): Edge => {
        const isPreviewed = edge.id === previewEdgeId;
        const isConnected =
          Boolean(selectedNode) &&
          (edge.source === selectedNode?.name ||
            edge.target === selectedNode?.name);
        const isDimmed =
          Boolean(selectedNode || previewEdgeId) && !isPreviewed && !isConnected;

        return {
          ...edge,
          label: isConnected || isPreviewed ? edge.label : undefined,
          animated: isPreviewed || edge.animated,
          className: cn(
            edge.className,
            isPreviewed && "dialog-edge-preview",
            isConnected && !isPreviewed && "dialog-edge-connected",
            isDimmed && "dialog-edge-dimmed",
          ),
          style: {
            ...edge.style,
            opacity: isDimmed ? 0.65 : 1,
            strokeWidth: isPreviewed ? 3 : isConnected ? 2.5 : 1.5,
          },
          zIndex: isPreviewed ? 20 : isConnected ? 10 : edge.zIndex,
        };
      }),
    [edges, previewEdgeId, selectedNode],
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
            id: buildChoiceEdgeId(
              connection.source,
              connection.target,
              choiceIndex,
            ),
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

  useEffect(
    () => () => {
      setDialogFlowInstance(null);
    },
    [],
  );

  useEffect(() => {
    if (!previewNodeName || !flowInstanceRef.current) return;
    if (!nodes.some((node) => node.id === previewNodeName)) return;

    const nodesToFit: Array<{ id: string }> = [{ id: previewNodeName }];
    if (
      previewEdgeId &&
      selectedNode?.name &&
      selectedNode.name !== previewNodeName &&
      nodes.some((node) => node.id === selectedNode.name)
    ) {
      nodesToFit.unshift({ id: selectedNode.name });
    }

    void flowInstanceRef.current.fitView({
      nodes: nodesToFit,
      duration: 250,
      padding: getChoicePreviewFitViewPadding(
        Boolean(previewEdgeId && selectedNode),
      ),
    });
  }, [nodes, previewEdgeId, previewNodeName, selectedNode]);

  useEffect(() => {
    const nodeName = peekQueuedDialogNodeFocus();
    if (!nodeName || !flowInstanceRef.current) return;
    if (!nodes.some((node) => node.id === nodeName)) return;

    clearQueuedDialogNodeFocus();
    void flowInstanceRef.current.fitView({
      nodes: [{ id: nodeName }],
      duration: 250,
      padding: 0.6,
    });
  }, [nodes]);

  return (
    <div
      ref={containerRef}
      aria-label="Dialog flow chart"
      className="dialog-flow-viewer h-full w-full bg-background"
      onKeyDownCapture={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const target = event.target;
        if (!(target instanceof HTMLElement) || !target.classList.contains("react-flow__node")) return;
        const storyNode = content.nodes.find((item) => item.name === target.dataset.id);
        if (!storyNode) return;
        event.preventDefault();
        event.stopPropagation();
        setSelectedNode(storyNode);
        requestAnimationFrame(() => document.getElementById("node-name")?.focus());
      }}
    >
      <ReactFlow
        fitView
        nodes={displayedNodes}
        edges={displayedEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_e, node) => setSelectedNode(node.data.metadata)}
        nodesConnectable
        deleteKeyCode={null}
        onInit={(instance) => {
          flowInstanceRef.current = instance;
          setDialogFlowInstance(instance);
          onLayout();
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1.3} />
      </ReactFlow>
    </div>
  );
};

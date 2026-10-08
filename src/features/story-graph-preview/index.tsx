import { Background, BackgroundVariant, Controls, ReactFlow } from "@xyflow/react";
import { useEffect, useMemo, useRef } from "react";

import { buildDialogGraph } from "@/features/dialog-viewer/helpers";
import type { StoryData, StoryNode } from "@/shared/types";

interface StoryGraphPreviewProps {
  story: StoryData;
  selectedName?: string | null;
  onSelect: (node: StoryNode) => void;
  compact?: boolean;
}

export const StoryGraphPreview = ({ story, selectedName, onSelect, compact = false }: StoryGraphPreviewProps) => {
  const fitPreview = useRef<((options: { padding: number; maxZoom: number }) => void) | null>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => fitPreview.current?.({ padding: compact ? 0.3 : 0.15, maxZoom: 1 }));
    return () => cancelAnimationFrame(frame);
  }, [story, compact]);
  const layout = useMemo(() => buildDialogGraph(story), [story]);
  const graph = useMemo(() => {
    const { nodes, edges } = layout;
    const connected = new Set(edges.filter((edge) => edge.source === selectedName || edge.target === selectedName).flatMap((edge) => [edge.source, edge.target]));
    return {
      nodes: nodes.map((node) => ({
        ...node, type: "default", data: { label: node.data.label }, selected: node.id === selectedName,
        ariaLabel: `Open node ${node.id}`, style: { borderColor: connected.has(node.id) ? "var(--chart-2)" : undefined },
      })),
      edges,
    };
  }, [layout, selectedName]);
  return (
    <div className="story-graph-preview h-full min-h-0 w-full" aria-label={compact ? "Small story graph preview" : "Pending story graph"}>
      <ReactFlow
        nodes={graph.nodes} edges={graph.edges} fitView minZoom={0.02} maxZoom={2}
        onInit={(flow) => { fitPreview.current = (options) => { void flow.fitView(options); }; }}
        fitViewOptions={{ padding: compact ? 0.3 : 0.15, maxZoom: 1 }}
        nodesDraggable={false} nodesConnectable={false} edgesReconnectable={false}
        deleteKeyCode={null} proOptions={{ hideAttribution: true }}
        onNodeClick={(_event, node) => {
          const match = story.nodes.find((entry) => entry.name === node.id);
          if (match) onSelect(match);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          const target = event.target;
          if (!(target instanceof HTMLElement) || !target.classList.contains("react-flow__node")) return;
          const match = story.nodes.find((entry) => entry.name === target.dataset.id);
          if (match) { event.preventDefault(); onSelect(match); }
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};

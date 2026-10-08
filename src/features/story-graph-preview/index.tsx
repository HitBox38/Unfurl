import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
} from "@xyflow/react";

import { usePreviewGraph } from "@/features/story-graph-preview/hooks/use-preview-graph";
import type { StoryData, StoryNode } from "@/shared/types";

interface StoryGraphPreviewProps {
  story: StoryData;
  selectedName?: string | null;
  onSelect: (node: StoryNode) => void;
  compact?: boolean;
}

export const StoryGraphPreview = ({
  story,
  selectedName,
  onSelect,
  compact = false,
}: StoryGraphPreviewProps) => {
  const { graph, fitPreview } = usePreviewGraph(story, selectedName, compact);
  return (
    <div
      className="story-graph-preview h-full min-h-0 w-full"
      aria-label={compact ? "Small story graph preview" : "Pending story graph"}
    >
      <ReactFlow
        nodes={graph.nodes}
        edges={graph.edges}
        fitView
        minZoom={0.02}
        maxZoom={2}
        onInit={(flow) => {
          fitPreview.current = (options) => {
            void flow.fitView(options);
          };
        }}
        fitViewOptions={{ padding: compact ? 0.3 : 0.15, maxZoom: 1 }}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesReconnectable={false}
        deleteKeyCode={null}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_event, node) => {
          const match = story.nodes.find((entry) => entry.name === node.id);
          if (match) onSelect(match);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          const target = event.target;
          if (
            !(target instanceof HTMLElement) ||
            !target.classList.contains("react-flow__node")
          )
            return;
          const match = story.nodes.find(
            (entry) => entry.name === target.dataset.id,
          );
          if (match) {
            event.preventDefault();
            onSelect(match);
          }
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};

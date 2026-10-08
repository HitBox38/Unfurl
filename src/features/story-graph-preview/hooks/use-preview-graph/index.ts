import { useEffect, useMemo, useRef } from "react";

import { buildDialogGraph } from "@/features/dialog-viewer/helpers";
import type { StoryData } from "@/shared/types";

export const usePreviewGraph = (
  story: StoryData,
  selectedName: string | null | undefined,
  compact: boolean,
) => {
  const fitPreview = useRef<
    ((options: { padding: number; maxZoom: number }) => void) | null
  >(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      fitPreview.current?.({ padding: compact ? 0.3 : 0.15, maxZoom: 1 }),
    );
    return () => cancelAnimationFrame(frame);
  }, [story, compact]);
  const layout = useMemo(() => buildDialogGraph(story), [story]);
  const graph = useMemo(() => {
    const { nodes, edges } = layout;
    const connected = new Set(
      edges
        .filter(
          (edge) =>
            edge.source === selectedName || edge.target === selectedName,
        )
        .flatMap((edge) => [edge.source, edge.target]),
    );
    return {
      nodes: nodes.map((node) => ({
        ...node,
        type: "default",
        data: { label: node.data.label },
        selected: node.id === selectedName,
        ariaLabel: `Open node ${node.id}`,
        style: {
          borderColor: connected.has(node.id) ? "var(--chart-2)" : undefined,
        },
      })),
      edges,
    };
  }, [layout, selectedName]);
  return { graph, fitPreview };
};

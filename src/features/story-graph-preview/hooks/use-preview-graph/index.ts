import { useEffect, useMemo, useRef } from "react";
import type { FitViewOptions } from "@xyflow/react";

import { buildDialogGraph } from "@/features/dialog-viewer/helpers";
import type { StoryData } from "@/shared/types";

export const usePreviewGraph = (
  story: StoryData,
  selectedName: string | null | undefined,
  compact: boolean,
) => {
  const fitPreview = useRef<
    ((options: FitViewOptions) => void) | null
  >(null);
  const layout = useMemo(() => buildDialogGraph(story), [story]);
  const connected = useMemo(
    () => new Set(
      layout.edges
        .filter(
          (edge) =>
            edge.source === selectedName || edge.target === selectedName,
        )
        .flatMap((edge) => [edge.source, edge.target]),
    ),
    [layout, selectedName],
  );
  useEffect(() => {
    const selected =
      compact && layout.nodes.find((node) => node.id === selectedName);
    const frame = requestAnimationFrame(() => {
      fitPreview.current?.({
        padding: compact ? 0.3 : 0.15,
        maxZoom: 1,
        ...(selected ? {
          nodes: layout.nodes
            .filter((node) => node.id === selected.id || connected.has(node.id))
            .map((node) => ({ id: node.id })),
        } : {}),
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [layout, selectedName, compact, connected]);
  const graph = useMemo(() => {
    const { nodes, edges } = layout;
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
  }, [layout, selectedName, connected]);
  return { graph, fitPreview };
};

import { useMemo } from "react";

import { PREVIEW_ARROW_SIZE } from "@/features/story-card/constants";
import { buildStoryPreview } from "@/features/story-card/helpers";
import { PreviewNodes } from "@/features/story-card/components/preview-nodes";
import { EmptyPreview } from "@/features/story-card/components/empty-preview";
import type { EditableFileRecord } from "@/shared/lib/editable-files-storage";

export const MiniGraph = ({ file }: { file: EditableFileRecord }) => {
  const { nodes, edges, width, height } = useMemo(
    () => buildStoryPreview(file.content),
    [file.content],
  );
  return (
    <svg
      role="img"
      aria-label={`Mini graph preview for ${file.name}`}
      viewBox={`0 0 ${width} ${height}`}
      className="h-36 w-full rounded-2xl bg-primary/5"
    >
      <defs>
        <marker
          id={`story-card-arrow-${file.id}`}
          markerUnits="userSpaceOnUse"
          markerWidth={PREVIEW_ARROW_SIZE}
          markerHeight={PREVIEW_ARROW_SIZE}
          refX="0"
          refY={PREVIEW_ARROW_SIZE / 2}
          orient="auto"
        >
          <path
            d={`M 0 0 L ${PREVIEW_ARROW_SIZE} ${PREVIEW_ARROW_SIZE / 2} L 0 ${PREVIEW_ARROW_SIZE} z`}
            className="fill-primary/70 dark:fill-chart-1/70"
          />
        </marker>
      </defs>
      {edges.map((edge) => (
        <path
          key={edge.id}
          d={edge.path}
          className="fill-none stroke-primary/40 dark:stroke-chart-1/40"
          strokeWidth="1.5"
          markerEnd={`url(#story-card-arrow-${file.id})`}
        />
      ))}
      {nodes.length === 0 ? (
        <EmptyPreview width={width} height={height} />
      ) : null}
      <PreviewNodes nodes={nodes} />
    </svg>
  );
};

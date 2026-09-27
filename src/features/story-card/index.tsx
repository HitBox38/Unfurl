import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { FileTypeBadge } from "@/shared/components";
import { cn } from "@/shared/lib/cn";
import { trackEvent } from "@/shared/lib/analytics";
import type { EditableFileRecord } from "@/shared/lib/editable-files-storage";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import type { ProjectRecord } from "@/shared/types";

import { PREVIEW_ARROW_SIZE } from "./constants";
import { buildStoryPreview } from "./helpers";

interface StoryCardProps {
  file: EditableFileRecord;
  project: ProjectRecord | undefined;
}

export const StoryCard = ({ file, project }: StoryCardProps) => {
  const { nodes, edges, width, height } = useMemo(
    () => buildStoryPreview(file.content),
    [file.content],
  );
  const projectName = project?.name ?? "Unknown project";

  return (
    <Link
      to="/files/$fileId"
      params={{ fileId: file.id }}
      onClick={() => trackEvent("recent_file_opened", {})}
      className="workspace-bubble group block overflow-hidden rounded-3xl p-2 outline-none transition-[border-color,box-shadow] hover:border-primary/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
    >
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
          <g>
            <rect
              x={width / 2 - 32}
              y={height / 2 - 12}
              width="64"
              height="24"
              rx="9"
              className="fill-card stroke-primary/35"
              strokeWidth="1.5"
            />
            <text
              x={width / 2}
              y={height / 2 + 3}
              textAnchor="middle"
              className="fill-muted-foreground text-[8px]"
            >
              Empty
            </text>
          </g>
        ) : null}
        {nodes.map((node, index) => (
          <g key={node.id}>
            <rect
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              rx={8}
              className={cn(
                "fill-card stroke-primary/35",
                index === 0 && "stroke-primary/70",
              )}
              strokeWidth="1.5"
            />
            <text
              x={node.x + node.width / 2}
              y={node.y + node.height / 2}
              dominantBaseline="central"
              textAnchor="middle"
              className="fill-card-foreground text-[8px] font-medium"
            >
              <title>{node.id}</title>
              {node.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="grid gap-4 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-heading text-base font-medium">
            {file.name}
          </h3>
          <p className="mt-1.5 truncate text-xs text-muted-foreground">
            {projectName} - {formatRelativeTime(file.updatedAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <FileTypeBadge fileType={file.fileType} />
          <span>{file.content.nodes.length} nodes</span>
        </div>
      </div>
    </Link>
  );
};

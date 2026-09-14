import { Link } from "@tanstack/react-router";

import { FileTypeBadge } from "@/shared/components";
import { cn } from "@/shared/lib/cn";
import { trackEvent } from "@/shared/lib/analytics";
import type { EditableFileRecord } from "@/shared/lib/editable-files-storage";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import type { ProjectRecord, StoryNode } from "@/shared/types";

interface StoryCardProps {
  file: EditableFileRecord;
  project: ProjectRecord | undefined;
}

interface PreviewNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface PreviewEdge {
  source: PreviewNode;
  target: PreviewNode;
}

class StoryCardPreview {
  private static readonly maxNodes = 5;
  private static readonly nodeWidth = 50;
  private static readonly nodeHeight = 18;
  private static readonly positions = [
    { x: 18, y: 35 },
    { x: 95, y: 18 },
    { x: 95, y: 54 },
    { x: 172, y: 18 },
    { x: 172, y: 54 },
  ] as const;

  static nodes(storyNodes: readonly StoryNode[]): PreviewNode[] {
    return storyNodes.slice(0, this.maxNodes).map((node, index) => ({
      id: node.name,
      label: node.name,
      ...this.positions[index],
    }));
  }

  static edges(storyNodes: readonly StoryNode[], nodes: readonly PreviewNode[]) {
    const nodesById = new Map(nodes.map((node) => [node.id, node]));

    return storyNodes.flatMap((storyNode): PreviewEdge[] => {
      const source = nodesById.get(storyNode.name);
      if (!source) return [];

      return storyNode.choices.flatMap((choice) => {
        const target = nodesById.get(choice.destination);
        return target ? [{ source, target }] : [];
      });
    });
  }

  static viewBox() {
    return "0 0 240 92";
  }

  static nodeRect(node: PreviewNode) {
    return {
      x: node.x,
      y: node.y,
      width: this.nodeWidth,
      height: this.nodeHeight,
      rx: 7,
    };
  }

  static edgePath(edge: PreviewEdge) {
    const startX = edge.source.x + this.nodeWidth;
    const startY = edge.source.y + this.nodeHeight / 2;
    const endX = edge.target.x;
    const endY = edge.target.y + this.nodeHeight / 2;
    const controlOffset = Math.max(24, (endX - startX) / 2);

    return `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;
  }
}

export const StoryCard = ({ file, project }: StoryCardProps) => {
  const nodes = StoryCardPreview.nodes(file.content.nodes);
  const edges = StoryCardPreview.edges(file.content.nodes, nodes);
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
        viewBox={StoryCardPreview.viewBox()}
        className="h-36 w-full rounded-2xl bg-primary/5"
      >
        <defs>
          <marker
            id={`story-card-arrow-${file.id}`}
            markerUnits="userSpaceOnUse"
            markerWidth="5"
            markerHeight="5"
            refX="5"
            refY="2.5"
            orient="auto"
          >
            <path d="M 0 0 L 5 2.5 L 0 5 z" className="fill-primary/60 dark:fill-chart-1/60" />
          </marker>
        </defs>
        <rect width="240" height="92" className="fill-primary/5" />
        {edges.map((edge, index) => (
          <path
            key={`${edge.source.id}-${edge.target.id}-${index}`}
            d={StoryCardPreview.edgePath(edge)}
            className="fill-none stroke-primary/40 dark:stroke-chart-1/40"
            strokeWidth="2"
            markerEnd={`url(#story-card-arrow-${file.id})`}
          />
        ))}
        {nodes.length === 0 ? (
          <g>
            <rect
              x="88"
              y="34"
              width="64"
              height="24"
              rx="9"
              className="fill-card stroke-primary/35"
              strokeWidth="1.5"
            />
            <text
              x="120"
              y="49"
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
              {...StoryCardPreview.nodeRect(node)}
              className={cn(
                "fill-card stroke-primary/35",
                index === 0 && "stroke-primary/70",
              )}
              strokeWidth="1.5"
            />
            <text
              x={node.x + 25}
              y={node.y + 12}
              textAnchor="middle"
              className="fill-card-foreground text-[7px] font-medium"
            >
              {node.label.slice(0, 12)}
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

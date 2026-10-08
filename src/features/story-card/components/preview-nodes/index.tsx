import { cn } from "@/shared/lib/cn";
import type { StoryPreview } from "@/features/story-card/types";

export const PreviewNodes = ({ nodes }: Pick<StoryPreview, "nodes">) => (
  <>
    {" "}
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
  </>
);

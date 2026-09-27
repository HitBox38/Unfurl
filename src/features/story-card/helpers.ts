import dagre from "dagre";

import type { StoryData, StoryNode } from "@/shared/types";

import {
  PREVIEW_ARROW_LEAD,
  PREVIEW_ARROW_SIZE,
  PREVIEW_LABEL_MAX_CHARS,
  PREVIEW_MARGIN,
  PREVIEW_MAX_DEPTH,
  PREVIEW_MAX_NODES,
  PREVIEW_MIN_HEIGHT,
  PREVIEW_MIN_WIDTH,
  PREVIEW_NODE_HEIGHT,
  PREVIEW_NODE_WIDTH,
} from "./constants";
import type { PreviewEdge, PreviewNode, StoryPreview } from "./types";

type Point = { x: number; y: number };

const findRootNames = (nodes: readonly StoryNode[], start: string | null) => {
  const targets = new Set(
    nodes.flatMap((node) => node.choices.map((choice) => choice.destination)),
  );
  const roots = nodes
    .filter((node) => !targets.has(node.name))
    .map((node) => node.name);
  const first =
    start && nodes.some((node) => node.name === start)
      ? start
      : (roots[0] ?? nodes[0]?.name);
  return first ? [first, ...roots.filter((name) => name !== first)] : [];
};

// Breadth-first from the start node so the preview shows how the story
// opens, not whichever passages happen to come first in the file. Extra
// roots fill leftover room so stories with separate threads still show them.
const pickPreviewNodes = (story: StoryData) => {
  const nodesByName = new Map(story.nodes.map((node) => [node.name, node]));
  const depths = new Map<string, number>();

  for (const root of findRootNames(story.nodes, story.start)) {
    const queue = [root];
    depths.set(root, 0);
    for (let name = queue.shift(); name; name = queue.shift()) {
      const depth = depths.get(name) ?? 0;
      if (depth >= PREVIEW_MAX_DEPTH) continue;
      for (const { destination } of nodesByName.get(name)?.choices ?? []) {
        if (depths.size >= PREVIEW_MAX_NODES) return depths;
        if (depths.has(destination) || !nodesByName.has(destination)) continue;
        depths.set(destination, depth + 1);
        queue.push(destination);
      }
    }
    if (depths.size >= PREVIEW_MAX_NODES) break;
  }

  return depths;
};

const truncateLabel = (label: string) =>
  label.length > PREVIEW_LABEL_MAX_CHARS
    ? `${label.slice(0, PREVIEW_LABEL_MAX_CHARS - 1).trimEnd()}…`
    : label;

// Every drawn edge spans one column, so a side-to-side curve never crosses
// another node.
// The path stops where the arrowhead begins so the line never shows
// through the head and blunts its tip.
const edgePath = (source: Point, target: Point) => {
  const startX = source.x + PREVIEW_NODE_WIDTH / 2;
  const endX = target.x - PREVIEW_NODE_WIDTH / 2 - PREVIEW_ARROW_SIZE;
  const curveEndX = endX - PREVIEW_ARROW_LEAD;
  const bend = (curveEndX - startX) / 2;
  return `M ${startX} ${source.y} C ${startX + bend} ${source.y}, ${curveEndX - bend} ${target.y}, ${curveEndX} ${target.y} L ${endX} ${target.y}`;
};

export const buildStoryPreview = (story: StoryData): StoryPreview => {
  const depths = pickPreviewNodes(story);

  const graph = new dagre.graphlib.Graph();
  graph.setGraph({ rankdir: "LR", nodesep: 8, ranksep: 34 });
  graph.setDefaultEdgeLabel(() => ({}));

  depths.forEach((_, name) => {
    graph.setNode(name, {
      width: PREVIEW_NODE_WIDTH,
      height: PREVIEW_NODE_HEIGHT,
    });
  });

  // Only edges that move one step deeper: back-edges and loops would have
  // to cross the whole thumbnail and read as noise at this size.
  story.nodes.forEach((node) => {
    const sourceDepth = depths.get(node.name);
    if (sourceDepth === undefined) return;
    node.choices.forEach((choice) => {
      if (depths.get(choice.destination) === sourceDepth + 1)
        graph.setEdge(node.name, choice.destination);
    });
  });

  dagre.layout(graph);

  const layout = graph.graph();
  const contentWidth = layout.width ?? 0;
  const contentHeight = layout.height ?? 0;
  const width = Math.max(PREVIEW_MIN_WIDTH, contentWidth + PREVIEW_MARGIN * 2);
  const height = Math.max(
    PREVIEW_MIN_HEIGHT,
    contentHeight + PREVIEW_MARGIN * 2,
  );
  const offsetX = (width - contentWidth) / 2;
  const offsetY = (height - contentHeight) / 2;
  const shift = (point: Point) => ({
    x: point.x + offsetX,
    y: point.y + offsetY,
  });

  const nodes: PreviewNode[] = [...depths.keys()].map((name) => {
    const { x, y } = shift(graph.node(name));
    return {
      id: name,
      label: truncateLabel(name),
      x: x - PREVIEW_NODE_WIDTH / 2,
      y: y - PREVIEW_NODE_HEIGHT / 2,
      width: PREVIEW_NODE_WIDTH,
      height: PREVIEW_NODE_HEIGHT,
    };
  });

  const edges: PreviewEdge[] = graph.edges().map(({ v, w }) => ({
    id: `${v}->${w}`,
    path: edgePath(shift(graph.node(v)), shift(graph.node(w))),
  }));

  return { nodes, edges, width, height };
};

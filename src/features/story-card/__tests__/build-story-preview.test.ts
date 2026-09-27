import { describe, expect, it } from "vitest";

import type { StoryData, StoryNode } from "@/shared/types";

import { PREVIEW_MAX_NODES } from "../constants";
import { buildStoryPreview } from "../helpers";

const node = (name: string, destinations: string[] = []): StoryNode =>
  ({
    name,
    metadata: {},
    content: [],
    choices: destinations.map((destination) => ({ text: "", destination })),
  }) as unknown as StoryNode;

const story = (nodes: StoryNode[], start: string | null = null): StoryData => ({
  title: null,
  start,
  nodes,
});

describe("buildStoryPreview", () => {
  it("starts from the story's start node rather than file order", () => {
    const preview = buildStoryPreview(
      story(
        [
          node("Alpha ending"),
          node("Intro", ["Middle"]),
          node("Middle", ["Alpha ending"]),
        ],
        "Intro",
      ),
    );

    expect(preview.nodes.map((n) => n.id)).toEqual([
      "Intro",
      "Middle",
      "Alpha ending",
    ]);
  });

  it("falls back to a node nothing points to when start is missing", () => {
    const preview = buildStoryPreview(
      story([node("B", ["C"]), node("C"), node("A", ["B"])]),
    );

    expect(preview.nodes[0]?.id).toBe("A");
  });

  it("drops back-edges so no arrow wraps around the thumbnail", () => {
    const preview = buildStoryPreview(
      story([node("A", ["B"]), node("B", ["C", "A"]), node("C", ["A"])], "A"),
    );

    expect(preview.edges.map((edge) => edge.id)).toEqual(["A->B", "B->C"]);
  });

  it("draws every edge left to right, inside the view box", () => {
    const preview = buildStoryPreview(
      story(
        [
          node("A", ["B", "C", "D"]),
          node("B", ["E"]),
          node("C", ["E"]),
          node("D", ["A"]),
          node("E", ["B"]),
        ],
        "A",
      ),
    );

    for (const edge of preview.edges) {
      const xs = [...edge.path.matchAll(/-?\d+(\.\d+)?/g)]
        .map((match) => Number(match[0]))
        .filter((_, index) => index % 2 === 0);
      expect(xs.at(-1)).toBeGreaterThan(xs[0] ?? Infinity);
      expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
      expect(Math.max(...xs)).toBeLessThanOrEqual(preview.width);
    }
    for (const n of preview.nodes) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeGreaterThanOrEqual(0);
      expect(n.x + n.width).toBeLessThanOrEqual(preview.width);
      expect(n.y + n.height).toBeLessThanOrEqual(preview.height);
    }
  });

  it("caps the node count and includes disconnected passages", () => {
    const many = Array.from({ length: 10 }, (_, index) => node(`N${index}`));
    const preview = buildStoryPreview(story(many, "N0"));

    expect(preview.nodes).toHaveLength(PREVIEW_MAX_NODES);
  });

  it("stops at three columns so labels stay legible", () => {
    const preview = buildStoryPreview(
      story([node("A", ["B"]), node("B", ["C"]), node("C", ["D"]), node("D")], "A"),
    );

    expect(preview.nodes.map((n) => n.id)).toEqual(["A", "B", "C"]);
  });

  it("truncates long labels with an ellipsis", () => {
    const preview = buildStoryPreview(
      story([node("Path of self mastery")], "Path of self mastery"),
    );

    expect(preview.nodes[0]?.label).toMatch(/…$/);
    expect(preview.nodes[0]?.id).toBe("Path of self mastery");
  });

  it("handles an empty story", () => {
    expect(buildStoryPreview(story([]))).toMatchObject({ nodes: [], edges: [] });
  });

  it("does not loop forever on duplicate node names", () => {
    const preview = buildStoryPreview(story([node("A"), node("A")]));

    expect(preview.nodes).toHaveLength(1);
  });
});

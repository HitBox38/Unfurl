import { describe, expect, it, vi } from "vitest";

import { computeNewNodePosition } from "@/features/dialog-viewer/compute-new-node-position";
import type { StoryData, StoryNode } from "@/shared/types";

const story = (nodes: StoryNode[]): StoryData => ({
  title: "Demo",
  start: nodes[0]?.name ?? null,
  nodes,
});

const node = (
  name: string,
  position?: { x: number; y: number },
): StoryNode => ({
  name,
  content: [],
  choices: [],
  metadata: {},
  ...(position ? { position } : {}),
});

describe("computeNewNodePosition", () => {
  it("places a new node below the selected positioned node", () => {
    expect(
      computeNewNodePosition(
        story([node("Intro", { x: 20, y: 30 })]),
        node("Intro", { x: 20, y: 30 }),
        null,
      ),
    ).toEqual({ x: 20, y: 150 });
  });

  it("places a new node to the right of the last positioned node", () => {
    expect(
      computeNewNodePosition(
        story([
          node("Intro", { x: 20, y: 30 }),
          node("Middle"),
          node("Outro", { x: 200, y: 40 }),
        ]),
        null,
        null,
      ),
    ).toEqual({ x: 360, y: 40 });
  });

  it("uses the viewport center when no nodes have positions", () => {
    vi.stubGlobal("innerWidth", 1200);
    vi.stubGlobal("innerHeight", 800);

    const flowInstance = {
      getViewport: () => ({ x: -100, y: -50, zoom: 2 }),
    };

    expect(
      computeNewNodePosition(story([node("Intro")]), null, flowInstance),
    ).toEqual({ x: 350, y: 225 });

    vi.unstubAllGlobals();
  });

  it("falls back to a simple grid position", () => {
    expect(
      computeNewNodePosition(story([node("Intro"), node("Outro")]), null, null),
    ).toEqual({ x: 320, y: 160 });
  });
});

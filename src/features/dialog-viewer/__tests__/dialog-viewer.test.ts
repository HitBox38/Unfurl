import { describe, expect, it } from "vitest";

import {
  buildChoiceEdgeId,
  buildDialogGraph,
} from "@/features/dialog-viewer/helpers";
import type { StoryData } from "@/shared/types";

describe("buildDialogGraph", () => {
  it("builds stable choice edge ids from source, target, and choice index", () => {
    expect(buildChoiceEdgeId("Intro", "Outro", 2)).toBe("eIntro-Outro-2");
  });

  it("uses stored Twee positions and stable node-name ids", () => {
    const graph = buildDialogGraph({
      title: "Demo",
      start: "Intro",
      nodes: [
        {
          name: "Intro",
          position: { x: 25, y: 50 },
          size: { width: 100, height: 100 },
          metadata: {},
          content: [],
          choices: [{ text: "Next", destination: "Outro" }],
        },
        {
          name: "Outro",
          position: { x: 200, y: 50 },
          size: { width: 100, height: 100 },
          metadata: {},
          content: [],
          choices: [],
        },
      ],
    } satisfies StoryData);

    expect(graph.nodes.map((node) => [node.id, node.position])).toEqual([
      ["Intro", { x: 25, y: 50 }],
      ["Outro", { x: 200, y: 50 }],
    ]);
    expect(graph.nodes.map((node) => node.type)).toEqual([
      "dialog",
      "dialog",
    ]);
    expect(graph.nodes.map((node) => node.style)).toEqual([
      undefined,
      undefined,
    ]);
    expect(graph.edges).toEqual([
      expect.objectContaining({
        source: "Intro",
        target: "Outro",
      }),
    ]);
    expect(graph.edges.map((edge) => edge.type)).toEqual([undefined]);
  });

  it("does not create edges to missing destination nodes", () => {
    const graph = buildDialogGraph({
      title: "Demo",
      start: "Intro",
      nodes: [
        {
          name: "Intro",
          metadata: {},
          content: [],
          choices: [{ text: "Broken", destination: "Missing" }],
        },
      ],
    } satisfies StoryData);

    expect(graph.edges).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";

import { buildDialogGraph } from "@/features/dialog-viewer/dialog-graph";
import type { StoryData } from "@/shared/types";

describe("buildDialogGraph", () => {
  it("uses stored Twee positions and stable node-name ids", () => {
    const graph = buildDialogGraph({
      title: "Demo",
      start: "Intro",
      nodes: [
        {
          name: "Intro",
          position: { x: 25, y: 50 },
          metadata: {},
          content: [],
          choices: [{ text: "Next", destination: "Outro" }],
        },
        {
          name: "Outro",
          position: { x: 200, y: 50 },
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
    expect(graph.edges).toEqual([
      expect.objectContaining({ source: "Intro", target: "Outro" }),
    ]);
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

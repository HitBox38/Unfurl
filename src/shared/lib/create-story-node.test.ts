import { describe, expect, it } from "vitest";

import {
  createStoryNode,
  uniqueStoryNodeName,
} from "@/shared/lib/create-story-node";

describe("uniqueStoryNodeName", () => {
  it("returns the base name when it is unused", () => {
    expect(uniqueStoryNodeName(["Intro"], "Node")).toBe("Node");
  });

  it("increments until the name is unique", () => {
    expect(uniqueStoryNodeName(["Node", "Node 2"], "Node")).toBe("Node 3");
  });
});

describe("createStoryNode", () => {
  it("creates an empty story node with optional position", () => {
    expect(createStoryNode("Node", { x: 10, y: 20 })).toEqual({
      name: "Node",
      content: [],
      choices: [],
      metadata: {},
      position: { x: 10, y: 20 },
    });
  });
});

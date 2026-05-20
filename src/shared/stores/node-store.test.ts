import { beforeEach, describe, expect, it } from "vitest";

import { useNodeStore } from "@/shared/stores/node-store";

describe("useNodeStore", () => {
  beforeEach(() => useNodeStore.setState({ node: null, previewNodeName: null }));

  it("starts with no selected node", () => {
    expect(useNodeStore.getState().node).toBeNull();
  });

  it("setNode updates the selected node", () => {
    const node = {
      name: "Intro",
      content: ["Hi"],
      choices: [],
      metadata: {},
    };
    useNodeStore.getState().setNode(node);
    expect(useNodeStore.getState().node).toBe(node);
  });

  it("setNode(null) clears the selection", () => {
    useNodeStore.getState().setNode({
      name: "x",
      content: [],
      choices: [],
      metadata: {},
    });
    useNodeStore.getState().setNode(null);
    expect(useNodeStore.getState().node).toBeNull();
  });

  it("setPreviewNodeName updates the previewed graph node", () => {
    useNodeStore.getState().setPreviewNodeName("Outro");
    expect(useNodeStore.getState().previewNodeName).toBe("Outro");

    useNodeStore.getState().setPreviewNodeName(null);
    expect(useNodeStore.getState().previewNodeName).toBeNull();
  });
});

import { beforeEach, describe, expect, it } from "vitest";

import { useJsonDataStore } from "@/shared/stores/json-data-store";
import type { StoryData } from "@/shared/types";

const sample: StoryData = {
  title: "Demo",
  start: "Intro",
  nodes: [
    {
      name: "Intro",
      content: ["Hi"],
      choices: [{ text: "Next", destination: "Outro" }],
      metadata: {},
    },
    {
      name: "Outro",
      content: ["Bye"],
      choices: [],
      metadata: {},
    },
  ],
};

describe("useJsonDataStore", () => {
  beforeEach(() => {
    useJsonDataStore.getState().reset();
  });

  it("starts empty", () => {
    const state = useJsonDataStore.getState();
    expect(state.name).toBe("");
    expect(state.content.nodes).toHaveLength(0);
    expect(state.isLoading).toBe(false);
  });

  it("setJson replaces content and name and clears loading", () => {
    useJsonDataStore.getState().setLoading(true);
    useJsonDataStore.getState().setJson(sample, "demo");
    const state = useJsonDataStore.getState();
    expect(state.name).toBe("demo");
    expect(state.content).toEqual(sample);
    expect(state.isLoading).toBe(false);
  });

  it("setNode updates only the matching node by name", () => {
    useJsonDataStore.getState().setJson(sample, "demo");
    useJsonDataStore.getState().setNode({
      name: "Intro",
      content: ["Updated"],
      choices: [],
      metadata: { visited: true },
    });
    const state = useJsonDataStore.getState();
    const intro = state.content.nodes.find((n) => n.name === "Intro");
    const outro = state.content.nodes.find((n) => n.name === "Outro");
    expect(intro?.content).toEqual(["Updated"]);
    expect(intro?.metadata).toEqual({ visited: true });
    expect(outro?.content).toEqual(["Bye"]);
  });
});

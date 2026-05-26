import { beforeEach, describe, expect, it } from "vitest";

import { getEditableFile, saveEditableFile } from "@/features/recent-files";
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

  it("setNode can rename a node and update story references", () => {
    useJsonDataStore.getState().setJson(
      {
        ...sample,
        nodes: sample.nodes.map((node) =>
          node.name === "Outro"
            ? {
                ...node,
                choices: [{ text: "Again", destination: "Intro" }],
              }
            : node,
        ),
      },
      "demo",
    );

    useJsonDataStore.getState().setNode(
      {
        name: "Start",
        content: ["Renamed"],
        choices: [{ text: "Next", destination: "Outro" }],
        metadata: {},
      },
      "Intro",
    );

    const state = useJsonDataStore.getState();
    expect(state.content.start).toBe("Start");
    expect(state.content.nodes.some((node) => node.name === "Intro")).toBe(
      false,
    );
    expect(state.content.nodes.find((node) => node.name === "Start")).toEqual(
      expect.objectContaining({ content: ["Renamed"] }),
    );
    expect(
      state.content.nodes.find((node) => node.name === "Outro")?.choices[0]
        ?.destination,
    ).toBe("Start");
  });

  it("persists node edits into the active editable file", () => {
    saveEditableFile(
      { name: "demo", fileType: "twee", content: sample },
      { createId: () => "demo-id" },
    );
    useJsonDataStore.getState().setJson(sample, "demo", "demo-id");

    useJsonDataStore.getState().setNode({
      name: "Intro",
      content: ["Stored edit"],
      choices: [],
      metadata: { visited: true },
    });

    expect(
      getEditableFile("demo-id")?.content.nodes.find(
        (node) => node.name === "Intro",
      )?.content,
    ).toEqual(["Stored edit"]);
  });

  it("persists active editable file renames", () => {
    saveEditableFile(
      { name: "demo", fileType: "twee", content: sample },
      { createId: () => "demo-id" },
    );
    useJsonDataStore.getState().setJson(sample, "demo", "demo-id");

    useJsonDataStore.getState().setName("renamed demo");

    expect(useJsonDataStore.getState().name).toBe("renamed demo");
    expect(getEditableFile("demo-id")?.name).toBe("renamed demo");
  });
});

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

  it("addNode appends a node and sets start when the story is empty", () => {
    useJsonDataStore.getState().setJson(
      { title: null, start: null, nodes: [] },
      "demo",
    );

    useJsonDataStore.getState().addNode({
      name: "Node",
      content: [],
      choices: [],
      metadata: {},
    });

    const state = useJsonDataStore.getState();
    expect(state.content.nodes).toHaveLength(1);
    expect(state.content.nodes[0]?.name).toBe("Node");
    expect(state.content.start).toBe("Node");
    expect(state.canUndo).toBe(true);
  });

  it("addNode ignores duplicate node names", () => {
    useJsonDataStore.getState().setJson(sample, "demo");

    useJsonDataStore.getState().addNode({
      name: "Intro",
      content: ["Duplicate"],
      choices: [],
      metadata: {},
    });

    expect(useJsonDataStore.getState().content).toEqual(sample);
  });

  it("removeNode deletes a node and strips choices pointing to it", () => {
    useJsonDataStore.getState().setJson(sample, "demo");

    useJsonDataStore.getState().removeNode("Outro");

    const state = useJsonDataStore.getState();
    expect(state.content.nodes).toHaveLength(1);
    expect(state.content.nodes[0]?.name).toBe("Intro");
    expect(state.content.nodes[0]?.choices).toEqual([]);
    expect(state.canUndo).toBe(true);
  });

  it("removeNode reassigns start when the start node is deleted", () => {
    useJsonDataStore.getState().setJson(sample, "demo");

    useJsonDataStore.getState().removeNode("Intro");

    const state = useJsonDataStore.getState();
    expect(state.content.start).toBe("Outro");
    expect(state.content.nodes).toHaveLength(1);
    expect(state.content.nodes[0]?.name).toBe("Outro");
  });

  it("removeNode allows deleting the only node", () => {
    useJsonDataStore.getState().setJson(
      {
        title: "Solo",
        start: "Only",
        nodes: [
          {
            name: "Only",
            content: [],
            choices: [],
            metadata: {},
          },
        ],
      },
      "demo",
    );

    useJsonDataStore.getState().removeNode("Only");

    const state = useJsonDataStore.getState();
    expect(state.content.nodes).toEqual([]);
    expect(state.content.start).toBeNull();
  });

  it("removeNode is a no-op for unknown node names", () => {
    useJsonDataStore.getState().setJson(sample, "demo");

    useJsonDataStore.getState().removeNode("Missing");

    expect(useJsonDataStore.getState().content).toEqual(sample);
    expect(useJsonDataStore.getState().canUndo).toBe(false);
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

  it("undoes and redoes node edits in the active editable file", () => {
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

    expect(useJsonDataStore.getState().canUndo).toBe(true);
    expect(useJsonDataStore.getState().canRedo).toBe(false);

    useJsonDataStore.getState().undo();

    expect(useJsonDataStore.getState().content).toEqual(sample);
    expect(getEditableFile("demo-id")?.content).toEqual(sample);
    expect(useJsonDataStore.getState().canUndo).toBe(false);
    expect(useJsonDataStore.getState().canRedo).toBe(true);

    useJsonDataStore.getState().redo();

    expect(
      useJsonDataStore
        .getState()
        .content.nodes.find((node) => node.name === "Intro")?.content,
    ).toEqual(["Stored edit"]);
    expect(
      getEditableFile("demo-id")?.content.nodes.find(
        (node) => node.name === "Intro",
      )?.content,
    ).toEqual(["Stored edit"]);
    expect(useJsonDataStore.getState().canUndo).toBe(true);
    expect(useJsonDataStore.getState().canRedo).toBe(false);
  });

  it("undoes file renames and clears redo when a new edit branches history", () => {
    saveEditableFile(
      { name: "demo", fileType: "twee", content: sample },
      { createId: () => "demo-id" },
    );
    useJsonDataStore.getState().setJson(sample, "demo", "demo-id");

    useJsonDataStore.getState().setName("renamed demo");
    useJsonDataStore.getState().undo();

    expect(useJsonDataStore.getState().name).toBe("demo");
    expect(getEditableFile("demo-id")?.name).toBe("demo");
    expect(useJsonDataStore.getState().canRedo).toBe(true);

    useJsonDataStore.getState().setName("branched demo");

    expect(useJsonDataStore.getState().name).toBe("branched demo");
    expect(useJsonDataStore.getState().canRedo).toBe(false);
  });

  it("clears edit history when a new file is loaded", () => {
    useJsonDataStore.getState().setJson(sample, "demo");
    useJsonDataStore.getState().setName("renamed demo");

    useJsonDataStore.getState().setJson(
      { title: "Other", start: null, nodes: [] },
      "other",
    );

    expect(useJsonDataStore.getState().canUndo).toBe(false);
    expect(useJsonDataStore.getState().canRedo).toBe(false);
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { AddNodeButton } from "@/features/add-node-button";
import { NodeEditor } from "@/features/node-editor";
import { useJsonDataStore, useNodeStore } from "@/shared/stores";

const story = {
  title: "Demo",
  start: "Intro",
  nodes: [
    {
      name: "Intro",
      position: { x: 0, y: 0 },
      metadata: {},
      content: [],
      choices: [{ text: "Next", destination: "Outro" }],
    },
    {
      name: "Outro",
      position: { x: 200, y: 0 },
      metadata: {},
      content: [],
      choices: [],
    },
  ],
};

describe("AddNodeButton", () => {
  afterEach(() => {
    useJsonDataStore.getState().reset();
    useNodeStore.getState().setNode(null);
  });

  it("creates a draft without changing the story until it is saved", async () => {
    const user = userEvent.setup();
    useJsonDataStore.getState().setJson(story, "demo", "demo-id");

    render(
      <>
        <AddNodeButton />
        <NodeEditor />
      </>,
    );

    await user.click(screen.getByRole("button", { name: /add node/i }));

    expect(useJsonDataStore.getState().content.nodes).toHaveLength(2);
    const addedNode = useNodeStore.getState().node;
    expect(addedNode).toEqual(
      expect.objectContaining({
        name: "Node",
        content: [],
        choices: [],
        metadata: {},
        position: expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
        }),
      }),
    );
    expect(useNodeStore.getState().node).toEqual(addedNode);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(useNodeStore.getState().node).toBeNull();
    expect(useJsonDataStore.getState().content.nodes).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Add node" }));
    await user.click(screen.getByRole("button", { name: "Create node" }));
    expect(useJsonDataStore.getState().content.nodes).toHaveLength(3);
    expect(useJsonDataStore.getState().canUndo).toBe(true);
  });
});

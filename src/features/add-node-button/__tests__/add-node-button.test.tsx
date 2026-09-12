import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { AddNodeButton } from "@/features/add-node-button";
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

  it("adds a story node and selects it for editing", async () => {
    const user = userEvent.setup();
    useJsonDataStore.getState().setJson(story, "demo", "demo-id");

    render(<AddNodeButton />);

    await user.click(screen.getByRole("button", { name: /add node/i }));

    const addedNode = useJsonDataStore
      .getState()
      .content.nodes.find((node) => node.name === "Node");
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
  });
});

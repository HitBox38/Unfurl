import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useJsonDataStore, useNodeStore } from "@/shared/stores";
import type { StoryData } from "@/shared/types";

import { DialogViewer } from "@/features/dialog-viewer";
import { NodeEditor } from "@/features/node-editor/node-editor";

const { flowInstance, reactFlow } = vi.hoisted(() => ({
  flowInstance: {
    fitView: vi.fn(),
  },
  reactFlow: vi.fn((_props: unknown) => <div data-testid="react-flow" />),
}));

vi.mock("@xyflow/react", () => ({
  ConnectionLineType: { Step: "step" },
  ReactFlow: reactFlow,
  useEdgesState: <T,>(initial: T[]) => [initial, vi.fn(), vi.fn()],
  useNodesState: <T,>(initial: T[]) => [initial, vi.fn(), vi.fn()],
}));

const story: StoryData = {
  title: "Demo",
  start: "Intro",
  nodes: [
    {
      name: "Intro",
      position: { x: 0, y: 0 },
      metadata: {},
      content: ["Hi"],
      choices: [{ text: "Next", destination: "Middle" }],
    },
    {
      name: "Middle",
      position: { x: 200, y: 0 },
      metadata: {},
      content: ["Middle"],
      choices: [],
    },
    {
      name: "Outro",
      position: { x: 400, y: 0 },
      metadata: {},
      content: ["Bye"],
      choices: [],
    },
  ],
};

const selectIntroNode = () => {
  useJsonDataStore.getState().setJson(story, "demo");
  useNodeStore.getState().setNode(story.nodes[0]);
};

const clearPreviewNode = () => {
  const state = useNodeStore.getState() as ReturnType<
    typeof useNodeStore.getState
  > & {
    setPreviewNodeName?: (nodeName: string | null) => void;
  };
  state.setPreviewNodeName?.(null);
};

describe("NodeEditor", () => {
  afterEach(() => {
    reactFlow.mockClear();
    flowInstance.fitView.mockClear();
    useJsonDataStore.getState().reset();
    useNodeStore.getState().setNode(null);
    clearPreviewNode();
  });

  it("updates a choice destination from the available story nodes", async () => {
    const user = userEvent.setup();
    selectIntroNode();

    render(<NodeEditor />);

    await user.click(
      screen.getByRole("combobox", { name: /destination for option next/i }),
    );
    await user.click(screen.getByRole("option", { name: "Outro" }));
    await user.click(screen.getByRole("button", { name: /update node/i }));

    expect(
      useJsonDataStore
        .getState()
        .content.nodes.find((node) => node.name === "Intro")?.choices[0]
        ?.destination,
    ).toBe("Outro");
  });

  it("highlights and focuses the destination node while an option is hovered", async () => {
    const user = userEvent.setup();
    selectIntroNode();

    render(
      <>
        <DialogViewer />
        <NodeEditor />
      </>,
    );

    const latestReactFlowProps = () =>
      reactFlow.mock.calls.at(-1)?.[0] as
        | {
            nodes: Array<{
              id: string;
              selected?: boolean;
              className?: string;
            }>;
            onInit?: (instance: typeof flowInstance) => void;
          }
        | undefined;

    latestReactFlowProps()?.onInit?.(flowInstance);

    await user.click(
      screen.getByRole("combobox", { name: /destination for option next/i }),
    );
    await user.hover(screen.getByRole("option", { name: "Outro" }));

    await waitFor(() => {
      expect(flowInstance.fitView).toHaveBeenCalledWith({
        nodes: [{ id: "Outro" }],
        duration: 250,
        padding: 0.6,
      });
    });

    await waitFor(() => {
      const outro = latestReactFlowProps()?.nodes.find(
        (node) => node.id === "Outro",
      );
      expect(outro).toEqual(
        expect.objectContaining({
          selected: true,
          className: expect.stringContaining("dialog-node-preview"),
        }),
      );
    });
  });
});

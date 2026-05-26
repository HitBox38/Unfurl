import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useJsonDataStore, useNodeStore } from "@/shared/stores";

import { DialogViewer } from "@/features/dialog-viewer/dialog-viewer";

const { reactFlow } = vi.hoisted(() => ({
  reactFlow: vi.fn((_props: unknown) => <div data-testid="react-flow" />),
}));

vi.mock("@xyflow/react", () => ({
  ConnectionLineType: { Step: "step" },
  ReactFlow: reactFlow,
  useEdgesState: <T,>(initial: T[]) => [initial, vi.fn(), vi.fn()],
  useNodesState: <T,>(initial: T[]) => [initial, vi.fn(), vi.fn()],
}));

const story = {
  title: "Demo",
  start: "Intro",
  nodes: [
    {
      name: "Intro",
      position: { x: 0, y: 0 },
      metadata: {},
      content: [],
      choices: [],
    },
  ],
};

describe("DialogViewer", () => {
  afterEach(() => {
    reactFlow.mockClear();
    Reflect.deleteProperty(window, "ipcRenderer");
    useJsonDataStore.getState().reset();
    useNodeStore.getState().setNode(null);
  });

  it("renders React Flow in dark mode so node labels remain visible", () => {
    useJsonDataStore.getState().setJson(story, "demo", "demo-id");

    render(<DialogViewer />);

    expect(reactFlow).toHaveBeenCalledWith(
      expect.objectContaining({ colorMode: "dark" }),
      undefined,
    );
  });

  it("fills the available flow workspace", () => {
    useJsonDataStore.getState().setJson(story, "demo", "demo-id");

    render(<DialogViewer />);

    expect(screen.getByLabelText(/dialog flow chart/i)).toHaveClass(
      "h-full",
      "w-full",
    );
  });

  it("highlights the selected story node", () => {
    useJsonDataStore.getState().setJson(story, "demo", "demo-id");
    useNodeStore.getState().setNode(story.nodes[0]);

    render(<DialogViewer />);

    const latestReactFlowProps = reactFlow.mock.calls.at(-1)?.[0] as
      | {
          nodes: Array<{
            id: string;
            selected?: boolean;
            className?: string;
          }>;
        }
      | undefined;

    expect(latestReactFlowProps?.nodes.find((node) => node.id === "Intro"))
      .toEqual(
        expect.objectContaining({
          selected: true,
          className: expect.stringContaining("dialog-node-selected"),
        }),
      );
  });
});

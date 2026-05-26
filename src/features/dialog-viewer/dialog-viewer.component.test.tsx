import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useJsonDataStore, useNodeStore } from "@/shared/stores";

import { DialogViewer } from "@/features/dialog-viewer/dialog-viewer";

const { addEdge, reactFlow, setEdges } = vi.hoisted(() => ({
  addEdge: vi.fn((connection, edges) => [...edges, connection]),
  reactFlow: vi.fn((_props: unknown) => <div data-testid="react-flow" />),
  setEdges: vi.fn((update: unknown) => {
    if (typeof update === "function") {
      update([]);
    }
  }),
}));

vi.mock("@xyflow/react", () => ({
  addEdge,
  ConnectionLineType: { Step: "step" },
  Handle: vi.fn(() => null),
  Position: { Bottom: "bottom", Top: "top" },
  ReactFlow: reactFlow,
  useEdgesState: <T,>(initial: T[]) => [initial, setEdges, vi.fn()],
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
    {
      name: "Outro",
      position: { x: 200, y: 0 },
      metadata: {},
      content: [],
      choices: [],
    },
  ],
};

describe("DialogViewer", () => {
  afterEach(() => {
    addEdge.mockClear();
    reactFlow.mockClear();
    setEdges.mockClear();
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

  it("creates a story choice when nodes are connected in the flow chart", () => {
    useJsonDataStore.getState().setJson(story, "demo", "demo-id");
    useNodeStore.getState().setNode(story.nodes[0]);

    render(<DialogViewer />);

    const latestReactFlowProps = reactFlow.mock.calls.at(-1)?.[0] as
      | {
          onConnect?: (connection: {
            source: string;
            target: string;
            sourceHandle: string | null;
            targetHandle: string | null;
          }) => void;
        }
      | undefined;

    expect(latestReactFlowProps?.onConnect).toEqual(expect.any(Function));

    latestReactFlowProps?.onConnect?.({
      source: "Intro",
      target: "Outro",
      sourceHandle: null,
      targetHandle: null,
    });

    expect(
      useJsonDataStore
        .getState()
        .content.nodes.find((node) => node.name === "Intro")?.choices,
    ).toContainEqual({ text: "", destination: "Outro" });
    expect(useNodeStore.getState().node?.choices).toContainEqual({
      text: "",
      destination: "Outro",
    });
    expect(addEdge).toHaveBeenCalledWith(
      expect.not.objectContaining({ type: expect.any(String) }),
      expect.any(Array),
    );
  });
});

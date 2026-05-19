import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useJsonDataStore } from "@/shared/stores";

import { DialogViewer } from "@/features/dialog-viewer/dialog-viewer";

const { reactFlow } = vi.hoisted(() => ({
  reactFlow: vi.fn(() => <div data-testid="react-flow" />),
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
  });

  it("renders React Flow in dark mode so node labels remain visible", () => {
    useJsonDataStore.getState().setJson(story, "demo", "demo-id");

    render(<DialogViewer />);

    expect(reactFlow).toHaveBeenCalledWith(
      expect.objectContaining({ colorMode: "dark" }),
      undefined,
    );
  });

  it("uses full web width outside Electron", () => {
    useJsonDataStore.getState().setJson(story, "demo", "demo-id");

    render(<DialogViewer />);

    expect(screen.getByLabelText(/dialog flow chart/i)).toHaveStyle({
      width: "100%",
    });
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DialogFlowNode } from "@/features/dialog-viewer/components/dialog-flow-node";
import { useDialogViewerUiStore } from "@/features/dialog-viewer/hooks/use-dialog-viewer-ui-store";
import { useJsonDataStore, useNodeStore } from "@/shared/stores";

vi.mock("@xyflow/react", () => ({
  Handle: () => null,
  Position: { Bottom: "bottom", Top: "top" },
}));

const story = {
  title: "Demo",
  start: "Intro",
  nodes: [
    {
      name: "Intro",
      content: [],
      choices: [{ text: "Next", destination: "Outro" }],
      metadata: {},
    },
    {
      name: "Outro",
      content: [],
      choices: [],
      metadata: {},
    },
  ],
};

const nodeProps = {
  id: "Intro",
  data: {
    label: "Intro",
    metadata: story.nodes[0]!,
  },
  selected: false,
  type: "dialog",
  zIndex: 0,
  dragging: false,
  draggable: true,
  selectable: true,
  deletable: true,
  isConnectable: true,
  positionAbsoluteX: 0,
  positionAbsoluteY: 0,
};

describe("DialogFlowNode", () => {
  afterEach(() => {
    useDialogViewerUiStore.getState().reset();
    useJsonDataStore.getState().reset();
    useNodeStore.getState().setNode(null);
    useNodeStore.getState().setGraphPreview(null);
  });

  it("hides the delete control when delete mode is off", () => {
    render(<DialogFlowNode {...nodeProps} />);

    expect(
      screen.queryByRole("button", { name: /delete node intro/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the delete control when delete mode is on", () => {
    useDialogViewerUiStore.getState().setDeleteMode(true);

    render(<DialogFlowNode {...nodeProps} />);

    expect(
      screen.getByRole("button", { name: /delete node intro/i }),
    ).toBeInTheDocument();
  });

  it("deletes the node and clears selection when the delete control is clicked", async () => {
    const user = userEvent.setup();
    useJsonDataStore.getState().setJson(story, "demo");
    useNodeStore.getState().setNode(story.nodes[0]!);
    useDialogViewerUiStore.getState().setDeleteMode(true);

    render(<DialogFlowNode {...nodeProps} />);

    await user.click(screen.getByRole("button", { name: /delete node intro/i }));

    expect(useJsonDataStore.getState().content.nodes).toHaveLength(1);
    expect(useJsonDataStore.getState().content.nodes[0]?.name).toBe("Outro");
    expect(useNodeStore.getState().node).toBeNull();
  });
});

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FilePage } from "@/app/pages/file-page";
import type { ConfirmDialogOptions } from "@/shared/hooks/use-confirm-dialog";
import { useStoryIdeStore } from "@/features/story-ide/hooks/use-story-ide-store";
import {
  getEditableFile,
  saveEditableFile,
} from "@/shared/lib/editable-files-storage";
import { useJsonDataStore, useNodeStore } from "@/shared/stores";
import type { StoryData } from "@/shared/types";

const { routeState, confirm, motionPreferences } = vi.hoisted(() => ({
  confirm: vi.fn<(options: ConfirmDialogOptions) => void>(),
  motionPreferences: { reduced: false },
  routeState: {
    fileId: "draft-id",
  },
}));

vi.mock("motion/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("motion/react")>()),
  useReducedMotion: () => motionPreferences.reduced,
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useParams: () => ({ fileId: routeState.fileId }),
}));

vi.mock("@/shared/hooks/use-confirm-dialog", () => ({
  useConfirmDialog: () => confirm,
}));

vi.mock("@/features/graph-node-toolbar", () => ({
  GraphNodeToolbar: () => (
    <div data-testid="graph-node-toolbar">
      <button
        type="button"
        aria-label="Add node"
        data-variant="ghost"
        data-size="icon"
      >
        Add node
      </button>
      <button
        type="button"
        aria-label="Delete nodes"
        aria-pressed="false"
        data-variant="ghost"
        data-size="icon"
      >
        Delete nodes
      </button>
    </div>
  ),
}));

vi.mock("@/features/dialog-viewer", () => ({
  DialogViewer: () => <div data-testid="dialog-viewer" />,
}));

vi.mock("@/features/node-editor", () => ({
  NodeEditor: ({
    onDirtyChange,
  }: {
    onDirtyChange?: (dirty: boolean) => void;
  }) => (
    <div data-testid="node-editor">
      <button onClick={() => onDirtyChange?.(true)}>Edit visual node</button>
    </div>
  ),
}));

const story: StoryData = {
  title: "Demo",
  start: "Intro",
  nodes: [
    {
      name: "Intro",
      content: ["Hi"],
      choices: [],
      metadata: {},
    },
  ],
};

describe("FilePage", () => {
  afterEach(() => {
    motionPreferences.reduced = false;
    routeState.fileId = "draft-id";
    useJsonDataStore.getState().reset();
    useNodeStore.getState().setNode(null);
    confirm.mockClear();
    useStoryIdeStore.setState({ workspaces: {}, storageError: null });
  });

  it("groups file actions in separate bubbles without an upload-another-file action", async () => {
    saveEditableFile(
      {
        id: "draft-id",
        name: "demo",
        fileType: "twee",
        content: story,
        projectId: "p1",
      },
      { now: () => 100 },
    );

    const { container } = render(<FilePage />);

    expect(
      await screen.findByRole("textbox", { name: /file name/i }),
    ).toHaveValue("demo");
    expect(
      container.querySelector('[data-testid="file-page-header"]'),
    ).toHaveClass("min-w-0", "workspace-bubble");
    expect(container.querySelector('[data-testid="file-toolbar"]')).toHaveClass(
      "flex-wrap",
      "gap-3",
    );
    expect(
      container.querySelector('[data-testid="file-add-node-bubble"]'),
    ).toHaveClass("workspace-bubble", "workspace-toolbar");
    expect(
      container.querySelector('[data-testid="file-history-bubble"]'),
    ).toHaveClass("workspace-bubble", "workspace-toolbar");
    expect(screen.getByRole("button", { name: /undo edit/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /redo edit/i })).toBeDisabled();
    const addNode = screen.getByRole("button", { name: /add node/i });
    expect(addNode).toHaveAttribute("data-variant", "ghost");
    expect(addNode).toHaveAttribute("data-size", "icon");
    const deleteNodes = screen.getByRole("button", { name: /delete nodes/i });
    expect(deleteNodes).toHaveAttribute("data-variant", "ghost");
    expect(deleteNodes).toHaveAttribute("data-size", "icon");
    expect(
      container.querySelector('[data-testid="file-add-node-bubble"]'),
    ).toContainElement(screen.getByTestId("graph-node-toolbar"));
    const download = screen.getByRole("button", { name: /export json/i });
    expect(download).toHaveAttribute("data-variant", "outline");
    expect(download).toHaveAttribute("data-size", "sm");
    expect(
      screen.queryByRole("link", { name: /upload another file/i }),
    ).not.toBeInTheDocument();
  });

  it("makes exiting graph controls inert and survives rapid view reversals", async () => {
    const user = userEvent.setup();
    saveEditableFile({
      id: "draft-id",
      name: "demo",
      fileType: "twee",
      content: story,
      projectId: "p1",
    });
    render(<FilePage />);
    const graph = await screen.findByRole("tab", { name: "Graph" });
    const ide = screen.getByRole("tab", { name: "IDE" });
    const actions = screen.getByTestId("file-add-node-bubble");
    const name = screen.getByRole("textbox", { name: "File name" });
    await user.click(ide);
    expect(actions).toHaveAttribute("inert");
    expect(actions).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("button", { name: "Delete nodes" })).not.toBeInTheDocument();
    const idePanel = screen.getByRole("tabpanel", { name: "IDE" });
    await user.click(graph);
    expect(idePanel).toHaveAttribute("inert");
    expect(idePanel).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button", { name: "Delete nodes" })).toBeVisible();
    await user.click(ide);
    await waitFor(() => expect(screen.queryByTestId("file-add-node-bubble")).not.toBeInTheDocument());
    expect(ide).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "IDE" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "File name" })).toBe(name);
    await user.keyboard("{ArrowLeft}{Enter}");
    expect(graph).toHaveAttribute("aria-selected", "true");
    expect(idePanel).toHaveAttribute("hidden");
    expect(screen.getAllByTestId("file-add-node-bubble")).toHaveLength(1);
    expect(getEditableFile("draft-id")?.content).toEqual(story);
  });

  it("keeps the IDE toolbar and graph controls free of scaling with reduced motion", async () => {
    motionPreferences.reduced = true;
    const user = userEvent.setup();
    saveEditableFile({
      id: "draft-id",
      name: "demo",
      fileType: "twee",
      content: story,
      projectId: "p1",
    });
    render(<FilePage />);
    await user.click(await screen.findByRole("tab", { name: "IDE" }));
    const workspace = await screen.findByRole("region", { name: "Story IDE" });
    const toolbar = workspace.firstElementChild as HTMLElement;
    await waitFor(() => expect(toolbar).toHaveStyle({ opacity: "1" }));
    expect(toolbar).toHaveStyle({ transform: "none" });
    await user.click(screen.getByRole("tab", { name: "Graph" }));
    const actions = screen.getByTestId("file-add-node-bubble");
    await waitFor(() => expect(actions).toHaveStyle({ opacity: "1" }));
    expect(actions).toHaveStyle({ transform: "none" });
  });

  it("shows a creative cue for a blank in-editor story", async () => {
    saveEditableFile(
      {
        id: "draft-id",
        name: "blank",
        fileType: "json",
        content: {
          title: "blank",
          start: "Start",
          nodes: [
            {
              name: "Start",
              content: [],
              choices: [],
              metadata: {},
            },
          ],
        },
        projectId: "p1",
      },
      { now: () => 100 },
    );

    render(<FilePage />);

    expect(
      await screen.findByText(/give start a first line/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/add a choice when the path branches/i),
    ).toBeInTheDocument();
  });

  it("saves header file name edits on blur", async () => {
    const user = userEvent.setup();
    saveEditableFile(
      {
        id: "draft-id",
        name: "demo",
        fileType: "twee",
        content: story,
        projectId: "p1",
      },
      { now: () => 100 },
    );

    render(<FilePage />);

    const fileName = await screen.findByRole("textbox", {
      name: /file name/i,
    });
    await user.clear(fileName);
    await user.type(fileName, "renamed demo");
    await user.tab();

    await waitFor(() => {
      expect(useJsonDataStore.getState().name).toBe("renamed demo");
      expect(getEditableFile("draft-id")?.name).toBe("renamed demo");
    });
  });

  it("saves header file name edits on Enter", async () => {
    const user = userEvent.setup();
    saveEditableFile(
      {
        id: "draft-id",
        name: "demo",
        fileType: "twee",
        content: story,
        projectId: "p1",
      },
      { now: () => 100 },
    );

    render(<FilePage />);

    const fileName = await screen.findByRole("textbox", {
      name: /file name/i,
    });
    await user.clear(fileName);
    await user.type(fileName, "entered demo{Enter}");

    await waitFor(() => {
      expect(useJsonDataStore.getState().name).toBe("entered demo");
      expect(getEditableFile("draft-id")?.name).toBe("entered demo");
    });
  });

  it("keeps the selected node aligned when undo restores file content", async () => {
    saveEditableFile(
      {
        id: "draft-id",
        name: "demo",
        fileType: "twee",
        content: story,
        projectId: "p1",
      },
      { now: () => 100 },
    );

    render(<FilePage />);

    await screen.findByRole("textbox", { name: /file name/i });

    act(() => {
      useNodeStore.getState().setNode(story.nodes[0]);
      useJsonDataStore.getState().setNode({
        name: "Intro",
        content: ["Changed"],
        choices: [],
        metadata: {},
      });
    });

    await waitFor(() => {
      expect(useNodeStore.getState().node?.content).toEqual(["Changed"]);
    });

    act(() => {
      useJsonDataStore.getState().undo();
    });

    await waitFor(() => {
      expect(useNodeStore.getState().node?.content).toEqual(["Hi"]);
    });
  });

  it("keeps the selected node aligned when undo and redo restore node renames", async () => {
    saveEditableFile(
      {
        id: "draft-id",
        name: "demo",
        fileType: "twee",
        content: story,
        projectId: "p1",
      },
      { now: () => 100 },
    );

    render(<FilePage />);

    await screen.findByRole("textbox", { name: /file name/i });

    act(() => {
      const renamedNode = {
        name: "Start",
        content: ["Renamed"],
        choices: [],
        metadata: {},
      };
      useNodeStore.getState().setNode(renamedNode);
      useJsonDataStore.getState().setNode(renamedNode, "Intro");
    });

    await waitFor(() => {
      expect(useNodeStore.getState().node?.name).toBe("Start");
    });

    act(() => {
      useJsonDataStore.getState().undo();
    });

    await waitFor(() => {
      expect(useNodeStore.getState().node?.name).toBe("Intro");
      expect(useNodeStore.getState().node?.content).toEqual(["Hi"]);
    });

    act(() => {
      useJsonDataStore.getState().redo();
    });

    await waitFor(() => {
      expect(useNodeStore.getState().node?.name).toBe("Start");
      expect(useNodeStore.getState().node?.content).toEqual(["Renamed"]);
    });
  });
  it("keeps the graph selected until an unsaved visual edit is explicitly discarded", async () => {
    const user = userEvent.setup();
    saveEditableFile({
      id: "draft-id",
      name: "demo",
      fileType: "json",
      content: story,
      projectId: "p1",
    });
    render(<FilePage />);
    const graph = await screen.findByRole("tab", { name: "Graph" });
    const ide = screen.getByRole("tab", { name: "IDE" });
    act(() => useNodeStore.getState().setNode(story.nodes[0]));
    await user.click(screen.getByRole("button", { name: "Edit visual node" }));
    await user.click(graph);
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(ide).toHaveFocus());
    expect(graph).toHaveAttribute("aria-selected", "true");
    expect(confirm).not.toHaveBeenCalled();
    await user.keyboard("{Enter}");
    expect(confirm).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Open IDE with unsaved node edits?" }),
    );
    expect(graph).toHaveAttribute("aria-selected", "true");
    confirm.mockClear();
    await user.click(ide);
    expect(graph).toHaveAttribute("aria-selected", "true");
    act(() => confirm.mock.calls[0][0].onConfirm());
    expect(ide).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "IDE" })).toBeVisible();
    expect(getEditableFile("draft-id")?.content).toEqual(story);
  });
});

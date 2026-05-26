import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FilePage } from "@/app/pages";
import { getEditableFile, saveEditableFile } from "@/features/recent-files";
import { useJsonDataStore, useNodeStore } from "@/shared/stores";
import type { StoryData } from "@/shared/types";

const { routeState } = vi.hoisted(() => ({
  routeState: {
    fileId: "draft-id",
  },
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
  }: {
    children: ReactNode;
    to: string;
  }) => <a href={to}>{children}</a>,
  useParams: () => ({ fileId: routeState.fileId }),
}));

vi.mock("@/features/dialog-viewer", () => ({
  DialogViewer: () => <div data-testid="dialog-viewer" />,
}));

vi.mock("@/features/node-editor", () => ({
  NodeEditor: () => <div data-testid="node-editor" />,
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
    routeState.fileId = "draft-id";
    useJsonDataStore.getState().reset();
    useNodeStore.getState().setNode(null);
  });

  it("renders a compact header without an upload-another-file action", async () => {
    saveEditableFile(
      { id: "draft-id", name: "demo", fileType: "twee", content: story },
      { now: () => 100 },
    );

    const { container } = render(<FilePage />);

    expect(
      await screen.findByRole("textbox", { name: /file name/i }),
    ).toHaveValue("demo");
    expect(
      container.querySelector('[data-testid="file-page-header"]'),
    ).toHaveClass(
      "absolute",
      "left-4",
      "top-4",
      "rounded-full",
      "bg-card/90",
      "shadow-lg",
      "backdrop-blur-md",
    );
    expect(
      container.querySelector('[data-testid="file-download-bubble"]'),
    ).toHaveClass(
      "absolute",
      "right-4",
      "top-4",
      "rounded-full",
      "bg-card/90",
    );
    const download = screen.getByRole("button", { name: /download/i });
    expect(download).toHaveAttribute(
      "data-variant",
      "secondary",
    );
    expect(download).toHaveAttribute("data-size", "icon-sm");
    expect(
      screen.queryByRole("link", { name: /upload another file/i }),
    ).not.toBeInTheDocument();
  });

  it("saves header file name edits on blur", async () => {
    const user = userEvent.setup();
    saveEditableFile(
      { id: "draft-id", name: "demo", fileType: "twee", content: story },
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
      { id: "draft-id", name: "demo", fileType: "twee", content: story },
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
});

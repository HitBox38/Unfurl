import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FileCard } from "@/features/file-card";
import {
  getEditableFile,
  saveEditableFile,
  type EditableFileRecord,
} from "@/shared/lib/editable-files-storage";
import { createProject } from "@/shared/lib/projects-storage";
import { useDialogStore } from "@/shared/stores";
import type { ProjectRecord, StoryData } from "@/shared/types";

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  Link: ({
    children,
    to,
    params,
    ...props
  }: {
    children: ReactNode;
    to: string;
    params?: Record<string, string>;
  }) => (
    <a
      href={to.replace(/\$(\w+)/g, (_, key: string) => params?.[key] ?? "")}
      {...props}
    >
      {children}
    </a>
  ),
}));

const story: StoryData = {
  title: "A Long Adventure",
  start: "Intro",
  nodes: [
    { name: "Intro", content: [], choices: [], metadata: {} },
    { name: "End", content: [], choices: [], metadata: {} },
  ],
};

describe("FileCard", () => {
  let projects: ProjectRecord[];
  let file: EditableFileRecord;

  beforeEach(() => {
    navigate.mockReset();
    useDialogStore.getState().reset();
    projects = [
      createProject({ name: "Alpha" }, { createId: () => "alpha", now: () => 1 }),
      createProject({ name: "Beta" }, { createId: () => "beta", now: () => 2 }),
    ];
    file = saveEditableFile(
      { name: "quest", fileType: "twee", content: story, projectId: "alpha" },
      { createId: () => "quest-id", now: () => Date.now() - 2 * 60_000 },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the file's name, story title, type, node count and age", () => {
    render(<FileCard file={file} projects={projects} />);

    expect(screen.getByRole("link", { name: /quest/i })).toHaveAttribute(
      "href",
      "/files/quest-id",
    );
    expect(screen.getByText("A Long Adventure")).toBeInTheDocument();
    expect(screen.getByText("twee")).toBeInTheDocument();
    expect(screen.getByText("2 nodes")).toBeInTheDocument();
    expect(screen.getByText(/2m ago/)).toBeInTheDocument();
  });

  it("opens the file from the actions menu", async () => {
    const user = userEvent.setup();
    render(<FileCard file={file} projects={projects} />);

    await user.click(screen.getByRole("button", { name: /actions for quest/i }));
    await user.click(await screen.findByRole("menuitem", { name: /^open$/i }));

    expect(navigate).toHaveBeenCalledWith({
      to: "/files/$fileId",
      params: { fileId: "quest-id" },
    });
  });

  it("renames through a form dialog", async () => {
    const user = userEvent.setup();
    render(<FileCard file={file} projects={projects} />);

    await user.click(screen.getByRole("button", { name: /actions for quest/i }));
    await user.click(await screen.findByRole("menuitem", { name: /rename/i }));

    const dialog = useDialogStore.getState();
    expect(dialog).toMatchObject({ isOpen: true, title: "Rename file", isForm: true });

    dialog.submitFunction?.({ name: "  epic quest " });

    expect(getEditableFile("quest-id")?.name).toBe("epic quest");
  });

  it("moves the file to another project from the submenu", async () => {
    const user = userEvent.setup();
    render(<FileCard file={file} projects={projects} />);

    await user.click(screen.getByRole("button", { name: /actions for quest/i }));
    await user.hover(await screen.findByRole("menuitem", { name: /move to/i }));
    // jsdom has no layout, so Radix's pointer "grace area" toward the submenu is
    // degenerate and a mouse click would close it first; keyboard navigation is
    // geometry-free and is how Radix documents submenu access anyway.
    await user.keyboard("{ArrowRight}");
    expect(await screen.findByRole("menuitem", { name: "Beta" })).toBeInTheDocument();
    await user.keyboard("{ArrowDown}{Enter}");

    expect(getEditableFile("quest-id")?.projectId).toBe("beta");
  });

  it("disables moving when there is no other project", async () => {
    const user = userEvent.setup();
    render(<FileCard file={file} projects={[projects[0]]} />);

    await user.click(screen.getByRole("button", { name: /actions for quest/i }));

    expect(await screen.findByRole("menuitem", { name: /move to/i })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("exports the story as JSON", async () => {
    const user = userEvent.setup();
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    render(<FileCard file={file} projects={projects} />);

    await user.click(screen.getByRole("button", { name: /actions for quest/i }));
    await user.click(await screen.findByRole("menuitem", { name: /export json/i }));

    expect(click).toHaveBeenCalledTimes(1);
    const anchor = click.mock.instances[0] as HTMLAnchorElement;
    expect(anchor.download).toBe("quest.json");
  });

  it("deletes after confirmation", async () => {
    const user = userEvent.setup();
    render(<FileCard file={file} projects={projects} />);

    await user.click(screen.getByRole("button", { name: /actions for quest/i }));
    await user.click(await screen.findByRole("menuitem", { name: /delete/i }));

    const dialog = useDialogStore.getState();
    expect(dialog.title).toMatch(/delete .*quest/i);
    expect(getEditableFile("quest-id")).not.toBeNull();

    dialog.functions?.find((action) => action.variant === "destructive")?.action();

    expect(getEditableFile("quest-id")).toBeNull();
  });
});

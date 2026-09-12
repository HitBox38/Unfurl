import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProjectHeader } from "@/features/project-header";
import { saveEditableFile } from "@/shared/lib/editable-files-storage";
import {
  createProject,
  getProject,
  listProjects,
} from "@/shared/lib/projects-storage";
import { useDialogStore } from "@/shared/stores";
import type { StoryData } from "@/shared/types";
import { TooltipProvider } from "@/shared/ui/tooltip";

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

const story: StoryData = { title: null, start: null, nodes: [] };

const renderHeader = (projectId: string, canDelete: boolean) => {
  const project = getProject(projectId);
  if (!project) throw new Error(`missing project ${projectId}`);
  return render(
    <TooltipProvider>
      <ProjectHeader project={project} fileCount={2} canDelete={canDelete} />
    </TooltipProvider>,
  );
};

describe("ProjectHeader", () => {
  beforeEach(() => {
    navigate.mockReset();
    useDialogStore.getState().reset();
    createProject({ name: "Space RPG" }, { createId: () => "rpg" });
  });

  it("links back to the projects overview and shows the file count and source", () => {
    renderHeader("rpg", false);

    expect(screen.getByRole("link", { name: /projects/i })).toHaveAttribute("href", "/");
    expect(screen.getByText("2 files")).toBeInTheDocument();
    expect(screen.getByText("local")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /metadata config/i })).toBeInTheDocument();
  });

  it("renames the project when the name input is committed", async () => {
    const user = userEvent.setup();
    renderHeader("rpg", false);

    const input = screen.getByRole("textbox", { name: /project name/i });
    expect(input).toHaveValue("Space RPG");
    await user.clear(input);
    await user.type(input, "Moon RPG{Enter}");

    expect(getProject("rpg")?.name).toBe("Moon RPG");
  });

  it("disables deletion of the only project", () => {
    renderHeader("rpg", false);

    expect(screen.getByRole("button", { name: /delete project/i })).toBeDisabled();
  });

  it("asks for confirmation, then deletes the project and returns home", async () => {
    const user = userEvent.setup();
    createProject({ name: "Other" }, { createId: () => "other" });
    saveEditableFile({ name: "f", fileType: "twee", content: story, projectId: "rpg" });
    renderHeader("rpg", true);

    await user.click(screen.getByRole("button", { name: /delete project/i }));

    const dialog = useDialogStore.getState();
    expect(dialog.isOpen).toBe(true);
    expect(dialog.title).toMatch(/delete .*space rpg/i);
    expect(listProjects()).toHaveLength(2);

    dialog.functions?.find((action) => action.variant === "destructive")?.action();

    expect(listProjects().map((project) => project.id)).toEqual(["other"]);
    expect(navigate).toHaveBeenCalledWith({ to: "/" });
  });
});

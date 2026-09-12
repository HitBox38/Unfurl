import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProjectPage } from "@/app/pages/project-page";
import {
  listEditableFilesByProject,
  saveEditableFile,
} from "@/shared/lib/editable-files-storage";
import { createProject } from "@/shared/lib/projects-storage";
import { useJsonDataStore } from "@/shared/stores";
import type { StoryData } from "@/shared/types";
import { TooltipProvider } from "@/shared/ui/tooltip";

const { navigate, routeState } = vi.hoisted(() => ({
  navigate: vi.fn(),
  routeState: { projectId: "rpg" },
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  useParams: () => ({ projectId: routeState.projectId }),
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

const story: StoryData = { title: null, start: null, nodes: [] };

const renderPage = () =>
  render(
    <TooltipProvider>
      <ProjectPage />
    </TooltipProvider>,
  );

describe("ProjectPage", () => {
  beforeEach(() => {
    navigate.mockReset();
    routeState.projectId = "rpg";
    createProject({ name: "Space RPG" }, { createId: () => "rpg" });
  });

  it("renders the header, the compact dropzone and an empty state without files", () => {
    renderPage();

    expect(screen.getByRole("textbox", { name: /project name/i })).toHaveValue("Space RPG");
    expect(screen.getByText("0 files")).toBeInTheDocument();
    expect(screen.getByTestId("file-import-dropzone")).toBeInTheDocument();
    expect(screen.getByText(/no files yet/i)).toBeInTheDocument();
  });

  it("lists only this project's files as cards", () => {
    createProject({ name: "Other" }, { createId: () => "other" });
    saveEditableFile({ name: "mine", fileType: "twee", content: story, projectId: "rpg" });
    saveEditableFile({ name: "theirs", fileType: "twee", content: story, projectId: "other" });

    renderPage();

    const files = screen.getByRole("region", { name: /files/i });
    expect(within(files).getByRole("link", { name: /mine/i })).toBeInTheDocument();
    expect(within(files).queryByRole("link", { name: /theirs/i })).not.toBeInTheDocument();
    expect(screen.getByText("1 file")).toBeInTheDocument();
  });

  it("shows a not-found card for an unknown project", () => {
    routeState.projectId = "nope";

    renderPage();

    expect(screen.getByText(/project not found/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to projects/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("imports files dropped anywhere on the page into the project", async () => {
    renderPage();
    const page = screen.getByTestId("project-page");

    fireEvent.dragEnter(page, { dataTransfer: { files: [], types: ["Files"] } });
    expect(screen.getByText(/drop to import into space rpg/i)).toBeInTheDocument();

    fireEvent.drop(page, {
      dataTransfer: { files: [new File([":: A\n"], "a.twee"), new File([":: B\n"], "b.twee")] },
    });

    await waitFor(() =>
      expect(listEditableFilesByProject("rpg").map((file) => file.name).sort()).toEqual([
        "a",
        "b",
      ]),
    );
    expect(screen.queryByText(/drop to import into/i)).not.toBeInTheDocument();
  });

  it("clears any open file when visited", () => {
    useJsonDataStore.getState().setJson(story, "left-over", "file", "rpg");

    renderPage();

    expect(useJsonDataStore.getState().activeFileId).toBeNull();
  });
});

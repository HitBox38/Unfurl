import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HomePage } from "@/app/pages/home-page";
import { saveEditableFile } from "@/shared/lib/editable-files-storage";
import { createProject } from "@/shared/lib/projects-storage";
import { useJsonDataStore } from "@/shared/stores";
import type { StoryData } from "@/shared/types";
import { TooltipProvider } from "@/shared/ui/tooltip";

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

const story: StoryData = { title: null, start: null, nodes: [] };

const renderHome = (isOnline = false) =>
  render(
    <TooltipProvider>
      <HomePage isOnline={isOnline} />
    </TooltipProvider>,
  );

describe("HomePage", () => {
  beforeEach(() => {
    navigate.mockReset();
    createProject({ name: "Older" }, { createId: () => "older", now: () => 1 });
    createProject({ name: "Newer" }, { createId: () => "newer", now: () => 2 });
  });

  it("shows the header with the online suffix and desktop link when online", () => {
    renderHome(true);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Unfurl Online");
    expect(screen.getByRole("link", { name: /desktop version/i })).toHaveAttribute(
      "href",
      "https://hit-box38.itch.io/unfurl",
    );
    expect(screen.getByRole("button", { name: /faq/i })).toBeInTheDocument();
  });

  it("omits online-only affordances on desktop", () => {
    renderHome(false);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/^Unfurl$/);
    expect(screen.queryByRole("link", { name: /desktop version/i })).not.toBeInTheDocument();
  });

  it("lists every project and a new-project action", () => {
    renderHome();

    const projects = screen.getByRole("region", { name: /projects/i });
    expect(within(projects).getByRole("link", { name: /older/i })).toHaveAttribute(
      "href",
      "/projects/older",
    );
    expect(within(projects).getByRole("link", { name: /newer/i })).toHaveAttribute(
      "href",
      "/projects/newer",
    );
    expect(screen.getByRole("button", { name: /new project/i })).toBeInTheDocument();
  });

  it("targets the most recently edited project for imports", () => {
    saveEditableFile(
      { name: "old-file", fileType: "twee", content: story, projectId: "older" },
      { now: () => 50 },
    );

    renderHome();

    expect(screen.getByRole("combobox", { name: /import into/i })).toHaveTextContent(
      "Older",
    );
    expect(screen.getByTestId("file-import-dropzone")).toBeInTheDocument();
  });

  it("shows recent files only once files exist", () => {
    const { unmount } = renderHome();
    expect(screen.queryByRole("region", { name: /recent files/i })).not.toBeInTheDocument();
    unmount();

    saveEditableFile({ name: "quest", fileType: "twee", content: story, projectId: "newer" });
    renderHome();

    expect(
      within(screen.getByRole("region", { name: /recent files/i })).getByRole("link", {
        name: /quest/i,
      }),
    ).toBeInTheDocument();
  });

  it("clears any open file when visited", () => {
    useJsonDataStore.getState().setJson(story, "left-over", "file", "newer");

    renderHome();

    expect(useJsonDataStore.getState().activeFileId).toBeNull();
    expect(useJsonDataStore.getState().name).toBe("");
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MouseEventHandler, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { RecentFilesSidebar } from "@/features/recent-files-sidebar";
import { saveEditableFile } from "@/shared/lib/editable-files-storage";
import { createProject } from "@/shared/lib/projects-storage";
import type { StoryData } from "@/shared/types";
import { SidebarProvider } from "@/shared/ui/sidebar";
import { TooltipProvider } from "@/shared/ui/tooltip";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    onClick,
    params,
    activeProps: _activeProps,
    ...props
  }: {
    children: ReactNode;
    to: string;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
    params?: Record<string, string>;
    activeProps?: unknown;
  }) => (
    <a
      href={to.replace(/\$(\w+)/g, (_, key: string) => params?.[key] ?? "")}
      onClick={onClick}
      {...props}
    >
      {children}
    </a>
  ),
}));

const story = (title: string | null): StoryData => ({
  title,
  start: null,
  nodes: [],
});

const seedFiles = () => {
  createProject({ name: "RPG" }, { createId: () => "rpg" });
  createProject({ name: "Shop dialogs" }, { createId: () => "shop" });
  saveEditableFile({
    name: "short-dialog",
    fileType: "md",
    content: story(null),
    projectId: "rpg",
  });
  saveEditableFile({
    name: "Lorcan02.1",
    fileType: "twee",
    content: story("A Long Adventure Story Title"),
    projectId: "rpg",
  });
};

const renderSidebar = () =>
  render(
    <TooltipProvider>
      <SidebarProvider>
        <RecentFilesSidebar />
      </SidebarProvider>
    </TooltipProvider>,
  );

describe("RecentFilesSidebar", () => {
  it("does not repeat the app wordmark or sidebar toggle", () => {
    renderSidebar();

    expect(
      screen.queryByRole("link", { name: /go to home page/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /toggle sidebar/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /collapse sidebar/i }),
    ).not.toBeInTheDocument();
  });

  it("groups files under project links and still lists empty projects", () => {
    seedFiles();
    renderSidebar();

    expect(screen.getByRole("link", { name: "RPG" })).toHaveAttribute(
      "href",
      "/projects/rpg",
    );
    expect(screen.getByRole("link", { name: "Shop dialogs" })).toHaveAttribute(
      "href",
      "/projects/shop",
    );
    expect(screen.getByText("Lorcan02.1")).toBeInTheDocument();
    expect(screen.getByText("short-dialog")).toBeInTheDocument();
  });

  it("shows each file on one line with type badge and relative time", () => {
    seedFiles();
    renderSidebar();

    expect(screen.getByText("Lorcan02.1")).toBeInTheDocument();
    expect(screen.getByText("twee")).toBeInTheDocument();
    expect(screen.getAllByText("just now").length).toBeGreaterThan(0);
    expect(
      screen.queryByText("A Long Adventure Story Title"),
    ).not.toBeInTheDocument();
  });

  it("filters the list by the search query and restores it on clear", async () => {
    const user = userEvent.setup();
    seedFiles();
    renderSidebar();

    await user.type(
      screen.getByRole("textbox", { name: /search editable files/i }),
      "lorcan",
    );

    expect(screen.getByText("Lorcan02.1")).toBeInTheDocument();
    expect(screen.queryByText("short-dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /clear search/i }));

    expect(screen.getByText("short-dialog")).toBeInTheDocument();
  });

  it("filters by project name and shows that project's files", async () => {
    const user = userEvent.setup();
    seedFiles();
    renderSidebar();

    await user.type(
      screen.getByRole("textbox", { name: /search editable files/i }),
      "shop",
    );

    expect(screen.getByRole("link", { name: "Shop dialogs" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "RPG" })).not.toBeInTheDocument();
    expect(screen.queryByText("Lorcan02.1")).not.toBeInTheDocument();
  });

  it("shows a guided empty state when no projects exist", () => {
    renderSidebar();

    expect(screen.getByText(/no files yet/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /import a file to get started/i }),
    ).toBeInTheDocument();
  });

  it("lists an empty project without the dashed import empty state", () => {
    createProject({ name: "Empty" }, { createId: () => "empty" });
    renderSidebar();

    expect(screen.getByRole("link", { name: "Empty" })).toHaveAttribute(
      "href",
      "/projects/empty",
    );
    expect(
      screen.queryByRole("link", { name: /import a file to get started/i }),
    ).not.toBeInTheDocument();
  });

  it("toggles the app theme from the sidebar footer", async () => {
    const user = userEvent.setup();
    document.documentElement.classList.add("dark");
    renderSidebar();

    const toggle = screen.getByRole("button", { name: /switch to light mode/i });
    expect(document.documentElement).toHaveClass("dark");

    await user.click(toggle);

    expect(document.documentElement).not.toHaveClass("dark");
    expect(
      screen.getByRole("button", { name: /switch to dark mode/i }),
    ).toBeInTheDocument();
  });

  it("shows a search-specific empty state with a clear action", async () => {
    const user = userEvent.setup();
    seedFiles();
    renderSidebar();

    await user.type(
      screen.getByRole("textbox", { name: /search editable files/i }),
      "zzznomatch",
    );

    expect(screen.getByText(/no files match your search/i)).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /clear search/i }),
    ).toHaveLength(2);
  });
});

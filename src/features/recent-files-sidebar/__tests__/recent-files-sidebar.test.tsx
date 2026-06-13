import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MouseEventHandler, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { RecentFilesSidebar } from "@/features/recent-files-sidebar";
import { saveEditableFile } from "@/shared/lib/editable-files-storage";
import type { StoryData } from "@/shared/types";
import { SidebarProvider } from "@/shared/ui/sidebar";
import { TooltipProvider } from "@/shared/ui/tooltip";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    onClick,
    params: _params,
    activeProps: _activeProps,
    ...props
  }: {
    children: ReactNode;
    to: string;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
    params?: unknown;
    activeProps?: unknown;
  }) => (
    <a href={to} onClick={onClick} {...props}>
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
  saveEditableFile({
    name: "short-dialog",
    fileType: "md",
    content: story(null),
  });
  saveEditableFile({
    name: "Lorcan02.1",
    fileType: "twee",
    content: story("A Long Adventure Story Title"),
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
  it("links the Unfurl title to the home page", () => {
    renderSidebar();

    expect(
      screen.getByRole("link", { name: /go to home page/i }),
    ).toHaveAttribute("href", "/");
  });

  it("renders saved files with a count in the group label", () => {
    seedFiles();
    renderSidebar();

    expect(screen.getByText("Lorcan02.1")).toBeInTheDocument();
    expect(screen.getByText("short-dialog")).toBeInTheDocument();
    expect(screen.getByText("Recent files (2)")).toBeInTheDocument();
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

  it("shows a guided empty state when no files exist", () => {
    renderSidebar();

    expect(screen.getByText(/no files yet/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /upload a file to get started/i }),
    ).toBeInTheDocument();
  });

  it("shows collapse and expand sidebar triggers", () => {
    renderSidebar();

    expect(
      screen.getByRole("button", { name: /collapse sidebar/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /expand sidebar/i }),
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
    // Both the search input's X control and the empty-state action clear the query.
    expect(
      screen.getAllByRole("button", { name: /clear search/i }),
    ).toHaveLength(2);
  });
});

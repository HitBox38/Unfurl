import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { RecentFilesStrip } from "@/features/recent-files-strip";
import { saveEditableFile } from "@/shared/lib/editable-files-storage";
import { createProject } from "@/shared/lib/projects-storage";
import type { StoryData } from "@/shared/types";

vi.mock("@tanstack/react-router", () => ({
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

describe("RecentFilesStrip", () => {
  it("renders nothing when there are no files", () => {
    const { container } = render(<RecentFilesStrip />);

    expect(container).toBeEmptyDOMElement();
  });

  it("lists the newest files first with their project, capped at the limit", () => {
    createProject({ name: "Alpha" }, { createId: () => "alpha" });
    createProject({ name: "Beta" }, { createId: () => "beta" });
    for (let index = 0; index < 4; index += 1) {
      saveEditableFile(
        {
          name: `file-${index}`,
          fileType: index % 2 === 0 ? "twee" : "json",
          content: story,
          projectId: index % 2 === 0 ? "alpha" : "beta",
        },
        { now: () => 1_000 + index, createId: () => `f${index}` },
      );
    }

    render(<RecentFilesStrip limit={3} />);

    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/files/f3",
      "/files/f2",
      "/files/f1",
    ]);
    expect(links[0]).toHaveTextContent("file-3");
    expect(links[0]).toHaveTextContent("Beta");
    expect(links[0]).toHaveTextContent("json");
  });
});

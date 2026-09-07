import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProjectCard } from "@/features/project-card";
import {
  listEditableFilesByProject,
  saveEditableFile,
} from "@/shared/lib/editable-files-storage";
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

const story: StoryData = { title: null, start: null, nodes: [] };

const project: ProjectRecord = {
  id: "rpg",
  name: "Space RPG",
  source: { kind: "local" },
  metadataConfig: {
    config: [
      { name: "gold", sign: "$", type: "number" },
      { name: "met", sign: "!", type: "boolean" },
    ],
  },
  createdAt: 1,
  updatedAt: 1,
};

describe("ProjectCard", () => {
  beforeEach(() => {
    navigate.mockReset();
  });

  it("links to the project and summarises its files, fields and last edit", () => {
    const files = [
      saveEditableFile(
        { name: "a", fileType: "twee", content: story, projectId: "rpg" },
        { now: () => Date.now() - 5 * 60_000 },
      ),
      saveEditableFile(
        { name: "b", fileType: "json", content: story, projectId: "rpg" },
        { now: () => Date.now() - 3 * 60_000 },
      ),
    ];

    render(<ProjectCard project={project} files={files} />);

    const link = screen.getByRole("link", { name: /space rpg/i });
    expect(link).toHaveAttribute("href", "/projects/rpg");
    expect(link).toHaveTextContent("2 files");
    expect(link).toHaveTextContent("2 metadata fields");
    expect(link).toHaveTextContent(/3m ago/i);
  });

  it("uses singular labels for a single file and field", () => {
    const single: ProjectRecord = {
      ...project,
      metadataConfig: { config: [project.metadataConfig.config[0]] },
    };
    const files = [
      saveEditableFile({ name: "a", fileType: "twee", content: story, projectId: "rpg" }),
    ];

    render(<ProjectCard project={single} files={files} />);

    const link = screen.getByRole("link", { name: /space rpg/i });
    expect(link).toHaveTextContent("1 file");
    expect(link).toHaveTextContent("1 metadata field");
  });

  it("imports files dropped onto it into that project", async () => {
    render(<ProjectCard project={project} files={[]} />);
    const card = screen.getByRole("link", { name: /space rpg/i });

    fireEvent.dragOver(card, { dataTransfer: { types: ["Files"] } });
    expect(card).toHaveAttribute("data-dragging", "true");

    fireEvent.drop(card, {
      dataTransfer: { files: [new File([":: Intro\n$ 5\n"], "quest.twee")] },
    });

    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    const [record] = listEditableFilesByProject("rpg");
    expect(record.name).toBe("quest");
    expect(record.content.nodes[0].metadata).toEqual({ gold: 5, met: false });
    expect(card).not.toHaveAttribute("data-dragging");
  });

  it("reports drops that could not be imported instead of navigating", async () => {
    render(<ProjectCard project={project} files={[]} />);
    const card = screen.getByRole("link", { name: /space rpg/i });

    fireEvent.drop(card, {
      dataTransfer: { files: [new File(["Hello"], "note.md")] },
    });

    expect(await screen.findByRole("status")).toHaveTextContent(/title/i);
    expect(navigate).not.toHaveBeenCalled();
  });
});

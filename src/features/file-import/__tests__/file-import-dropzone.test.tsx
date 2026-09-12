import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FileImportDropzone } from "@/features/file-import";
import { listEditableFiles } from "@/shared/lib/editable-files-storage";
import { createProject } from "@/shared/lib/projects-storage";

const { navigate } = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
}));

const dropFiles = (target: HTMLElement, files: File[]) =>
  fireEvent.drop(target, { dataTransfer: { files, types: ["Files"] } });

describe("FileImportDropzone", () => {
  let projectId: string;

  beforeEach(() => {
    navigate.mockReset();
    projectId = createProject({ name: "RPG" }).id;
  });

  it("imports a dropped .twee file immediately and opens it", async () => {
    render(<FileImportDropzone projectId={projectId} />);

    dropFiles(
      screen.getByTestId("file-import-dropzone"),
      [new File([":: Intro\nHello\n"], "quest.twee")],
    );

    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    const [record] = listEditableFiles();
    expect(record).toMatchObject({ name: "quest", fileType: "twee", projectId });
    expect(navigate).toHaveBeenCalledWith({
      to: "/files/$fileId",
      params: { fileId: record.id },
    });
  });

  it("navigates to the project when several files are imported at once", async () => {
    render(<FileImportDropzone projectId={projectId} />);

    dropFiles(screen.getByTestId("file-import-dropzone"), [
      new File([":: A\n"], "a.twee"),
      new File([":: B\n"], "b.twee"),
    ]);

    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    expect(navigate).toHaveBeenCalledWith({
      to: "/projects/$projectId",
      params: { projectId },
    });
    expect(listEditableFiles()).toHaveLength(2);
  });

  it("stages .md notes until a story title is provided", async () => {
    const user = userEvent.setup();
    render(<FileImportDropzone projectId={projectId} />);

    dropFiles(screen.getByTestId("file-import-dropzone"), [
      new File(["Hello\n[[End]]"], "Start.md"),
      new File(["Bye"], "End.md"),
    ]);

    expect(await screen.findByText("Start.md")).toBeInTheDocument();
    expect(screen.getByText("End.md")).toBeInTheDocument();
    const importButton = screen.getByRole("button", { name: /import 2 notes/i });
    expect(importButton).toBeDisabled();
    expect(listEditableFiles()).toHaveLength(0);

    await user.type(screen.getByLabelText(/story title/i), "Obsidian tale");
    expect(importButton).toBeEnabled();

    await user.click(importButton);

    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    const [record] = listEditableFiles();
    expect(record).toMatchObject({ name: "Obsidian tale", fileType: "md" });
    expect(record.content.nodes.map((node) => node.name)).toEqual(["Start", "End"]);
  });

  it("lets a staged note be removed before importing", async () => {
    const user = userEvent.setup();
    render(<FileImportDropzone projectId={projectId} />);

    dropFiles(screen.getByTestId("file-import-dropzone"), [
      new File(["Hello"], "Start.md"),
      new File(["Bye"], "End.md"),
    ]);

    await user.click(await screen.findByRole("button", { name: /remove end\.md/i }));

    expect(screen.queryByText("End.md")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /import 1 note$/i })).toBeInTheDocument();
  });

  it("summarises skipped and failed files without navigating", async () => {
    render(<FileImportDropzone projectId={projectId} />);

    dropFiles(screen.getByTestId("file-import-dropzone"), [
      new File(["nope"], "notes.txt"),
      new File(["{broken"], "broken.json"),
    ]);

    expect(await screen.findByText("notes.txt")).toBeInTheDocument();
    expect(screen.getByText("broken.json")).toBeInTheDocument();
    expect(screen.getByText(/invalid json/i)).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("accepts files from the picker as well", async () => {
    const user = userEvent.setup();
    render(<FileImportDropzone projectId={projectId} />);

    const input = screen.getByLabelText(/browse files/i, { selector: "input" });
    expect(input).toHaveAttribute("accept", ".twee,.json,.md");
    expect(input).toHaveAttribute("multiple");

    await user.upload(input, new File([":: Intro\n"], "picked.twee"));

    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    expect(listEditableFiles()[0]).toMatchObject({ name: "picked" });
  });
});

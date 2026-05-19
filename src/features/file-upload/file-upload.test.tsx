import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useJsonDataStore } from "@/shared/stores";

import { FileUpload } from "@/features/file-upload/file-upload";

const { navigate } = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
}));

describe("FileUpload", () => {
  beforeEach(() => {
    navigate.mockReset();
    useJsonDataStore.getState().reset();
  });

  it("renders Twee as the default selected file type", () => {
    render(<FileUpload />);
    expect(screen.getByLabelText(/file type/i)).toHaveTextContent("Twee");
  });

  it("updates the file-input label and accept attribute when the type changes", async () => {
    render(<FileUpload />);
    const trigger = screen.getByLabelText(/file type/i);
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("option", { name: /JSON/i }));

    const fileInput = screen.getByLabelText(/select a \.json file/i, {
      selector: "input",
    });
    expect(fileInput).toHaveAttribute("accept", ".json");
    expect(fileInput).not.toHaveAttribute("multiple");
  });

  it("shows the dialog-title input when switching to Obsidian (md)", async () => {
    render(<FileUpload />);
    const trigger = screen.getByLabelText(/file type/i);
    await userEvent.click(trigger);
    await userEvent.click(
      screen.getByRole("option", { name: /Obsidian/i }),
    );
    expect(
      screen.getByPlaceholderText(/what is the title of this dialog/i),
    ).toBeInTheDocument();
    const fileInput = screen.getByLabelText(/select \.md files/i, {
      selector: "input",
    });
    expect(fileInput).toHaveAttribute("multiple");
  });

  it("keeps md upload disabled until a title is provided", async () => {
    render(<FileUpload />);
    const trigger = screen.getByLabelText(/file type/i);
    await userEvent.click(trigger);
    await userEvent.click(
      screen.getByRole("option", { name: /Obsidian/i }),
    );

    const fileInput = screen.getByLabelText(/select \.md files/i, {
      selector: "input",
    }) as HTMLInputElement;
    await userEvent.upload(
      fileInput,
      new File(["# Intro"], "intro.md", { type: "text/markdown" }),
    );

    expect(screen.getByRole("button", { name: /^upload$/i })).toBeDisabled();
  });

  it("upload button is disabled until a file is selected", () => {
    render(<FileUpload />);
    const upload = screen.getByRole("button", { name: /^upload$/i });
    expect(upload).toBeDisabled();
  });

  it("renders a badge with the selected file's name", async () => {
    render(<FileUpload />);
    const fileInput = screen.getByLabelText(/select a \.twee file/i, {
      selector: "input",
    }) as HTMLInputElement;

    const file = new File(["body"], "story.twee", { type: "text/plain" });
    await userEvent.upload(fileInput, file);

    const badge = await screen.findByText("story.twee");
    expect(badge).toBeInTheDocument();
    const remove = within(badge.parentElement as HTMLElement).getByRole(
      "button",
      { name: /remove story\.twee/i },
    );
    expect(remove).toBeInTheDocument();
  });
});

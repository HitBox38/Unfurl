import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { NewStoryButton } from "@/features/new-story";
import { createProject } from "@/shared/lib/projects-storage";
import { listEditableFilesByProject } from "@/shared/lib/editable-files-storage";
const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({ useNavigate: () => navigate }));
it("creates portable stories with unique names and project metadata defaults", async () => {
  const user = userEvent.setup();
  const project = createProject({
    name: "RPG",
    metadataConfig: { config: [{ name: "gold", sign: "$", type: "number" }] },
  });
  render(<NewStoryButton project={project} />);
  await user.click(screen.getByRole("button", { name: "New story" }));
  await user.click(screen.getByRole("button", { name: "New story" }));
  const files = listEditableFilesByProject(project.id);
  expect(new Set(files.map((file) => file.name))).toEqual(
    new Set(["Untitled story", "Untitled story 2"]),
  );
  expect(files[0]).toMatchObject({
    fileType: "json",
    content: {
      start: "Start",
      nodes: [{ name: "Start", metadata: { gold: 0 } }],
    },
  });
  expect(navigate).toHaveBeenCalledWith({
    to: "/files/$fileId",
    params: { fileId: expect.any(String) },
  });
});

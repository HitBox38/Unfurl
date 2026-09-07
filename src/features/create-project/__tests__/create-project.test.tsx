import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NewProjectButton } from "@/features/create-project";
import { listProjects } from "@/shared/lib/projects-storage";
import { useDialogStore } from "@/shared/stores";

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
}));

describe("NewProjectButton", () => {
  beforeEach(() => {
    navigate.mockReset();
    useDialogStore.getState().reset();
  });

  it("opens a form dialog that creates the project and opens it", async () => {
    const user = userEvent.setup();
    render(<NewProjectButton />);

    await user.click(screen.getByRole("button", { name: /new project/i }));

    const dialog = useDialogStore.getState();
    expect(dialog.isOpen).toBe(true);
    expect(dialog.title).toBe("New project");
    expect(dialog.isForm).toBe(true);
    expect(dialog.formName).toBe("create-project");

    dialog.submitFunction?.({ name: "  Space RPG " });

    const [project] = listProjects();
    expect(project).toMatchObject({ name: "Space RPG", source: { kind: "local" } });
    expect(navigate).toHaveBeenCalledWith({
      to: "/projects/$projectId",
      params: { projectId: project.id },
    });
  });
});

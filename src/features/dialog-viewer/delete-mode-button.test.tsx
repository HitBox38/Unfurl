import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { DeleteModeButton } from "@/features/dialog-viewer/delete-mode-button";
import { useDialogViewerUiStore } from "@/features/dialog-viewer/dialog-viewer-ui-store";

describe("DeleteModeButton", () => {
  afterEach(() => {
    useDialogViewerUiStore.getState().reset();
  });

  it("toggles delete mode and reflects aria-pressed", async () => {
    const user = userEvent.setup();

    render(<DeleteModeButton />);

    const button = screen.getByRole("button", { name: /delete nodes/i });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(useDialogViewerUiStore.getState().isDeleteMode).toBe(false);

    await user.click(button);

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(useDialogViewerUiStore.getState().isDeleteMode).toBe(true);

    await user.click(button);

    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(useDialogViewerUiStore.getState().isDeleteMode).toBe(false);
  });
});

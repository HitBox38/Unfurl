import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useConfirmDialog } from "@/shared/hooks/use-confirm-dialog";
import { useDialogStore } from "@/shared/stores";

describe("useConfirmDialog", () => {
  beforeEach(() => {
    useDialogStore.getState().reset();
  });

  it("opens the shared dialog with a destructive confirm action", () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() => useConfirmDialog());

    act(() => {
      result.current({
        title: "Delete file?",
        description: "This cannot be undone.",
        confirmLabel: "Delete",
        onConfirm,
      });
    });

    const state = useDialogStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.title).toBe("Delete file?");
    expect(state.functions).toHaveLength(2);
    const [cancel, confirm] = state.functions ?? [];
    expect(cancel).toMatchObject({ name: "Cancel", variant: "secondary" });
    expect(confirm).toMatchObject({ name: "Delete", variant: "destructive" });
    expect(onConfirm).not.toHaveBeenCalled();

    act(() => {
      confirm.action();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

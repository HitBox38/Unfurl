import { beforeEach, describe, expect, it } from "vitest";

import { useDialogStore } from "@/shared/stores/dialog-store";

describe("useDialogStore", () => {
  beforeEach(() => useDialogStore.getState().reset());

  it("setContent applies the new dialog content", () => {
    useDialogStore.getState().setContent({
      isOpen: true,
      title: "Hello",
      content: "world",
    });
    const state = useDialogStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.title).toBe("Hello");
    expect(state.content).toBe("world");
  });

  it("clears leftover optional fields when a new dialog opens", () => {
    useDialogStore.getState().setContent({
      isOpen: true,
      title: "FAQ",
      description: "About the app",
      content: "faq",
    });
    useDialogStore.getState().setContent({
      isOpen: true,
      title: "Confirm",
      content: "sure?",
    });

    const state = useDialogStore.getState();
    expect(state.title).toBe("Confirm");
    expect(state.description).toBeUndefined();
    expect(state.content).toBe("sure?");
  });

  it("setOpen() toggles the open state when called with no argument", () => {
    useDialogStore.getState().setContent({ isOpen: false, content: null });
    useDialogStore.getState().setOpen();
    expect(useDialogStore.getState().isOpen).toBe(true);
    useDialogStore.getState().setOpen();
    expect(useDialogStore.getState().isOpen).toBe(false);
  });

  it("setOpen(false) explicitly closes", () => {
    useDialogStore.getState().setContent({ isOpen: true, content: null });
    useDialogStore.getState().setOpen(false);
    expect(useDialogStore.getState().isOpen).toBe(false);
  });
});

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useKeyboardShortcut } from "@/shared/hooks/use-keyboard-shortcut";

const fireKey = (code: string, init: Partial<KeyboardEventInit> = {}) => {
  act(() => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { code, ...init, bubbles: true }),
    );
  });
};

describe("useKeyboardShortcut", () => {
  it("invokes the action after the configured sequence with required modifier", () => {
    const action = vi.fn();
    renderHook(() =>
      useKeyboardShortcut(action, {
        codes: ["KeyC", "KeyF"],
        ctrlKey: true,
      }),
    );
    fireKey("KeyC", { ctrlKey: true });
    fireKey("KeyF", { ctrlKey: true });
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("resets the sequence when an unexpected key interrupts it", () => {
    const action = vi.fn();
    renderHook(() =>
      useKeyboardShortcut(action, { codes: ["KeyA", "KeyB"] }),
    );
    fireKey("KeyA");
    fireKey("KeyX");
    fireKey("KeyB");
    expect(action).not.toHaveBeenCalled();
  });

  it("invokes once per full sequence completion", () => {
    const action = vi.fn();
    renderHook(() =>
      useKeyboardShortcut(action, { codes: ["KeyU", "KeyP"] }),
    );
    fireKey("KeyU");
    fireKey("KeyP");
    fireKey("KeyU");
    fireKey("KeyP");
    expect(action).toHaveBeenCalledTimes(2);
  });
});

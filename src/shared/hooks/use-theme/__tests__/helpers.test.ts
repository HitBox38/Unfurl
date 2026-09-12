import { afterEach, describe, expect, it, vi } from "vitest";

import { TITLE_BAR_OVERLAY_CHANNEL } from "@/shared/types/title-bar-overlay";

import { applyTheme, syncTitleBarOverlay } from "../helpers";

describe("useTheme helpers", () => {
  afterEach(() => {
    document.documentElement.classList.remove("dark");
    Reflect.deleteProperty(window, "ipcRenderer");
  });

  it("applies the dark class and syncs the Electron title bar overlay", () => {
    const send = vi.fn();
    Object.defineProperty(window, "ipcRenderer", {
      configurable: true,
      value: { send },
    });

    applyTheme("dark");

    expect(document.documentElement).toHaveClass("dark");
    expect(send).toHaveBeenCalledWith(TITLE_BAR_OVERLAY_CHANNEL, {
      color: "#18181b",
      symbolColor: "#fafafa",
      height: 32,
    });
  });

  it("syncs the light title bar overlay without requiring React", () => {
    const send = vi.fn();
    Object.defineProperty(window, "ipcRenderer", {
      configurable: true,
      value: { send },
    });

    syncTitleBarOverlay("light");

    expect(send).toHaveBeenCalledWith(TITLE_BAR_OVERLAY_CHANNEL, {
      color: "#fafafa",
      symbolColor: "#09090b",
      height: 32,
    });
  });

  it("skips title bar overlay sync outside Electron", () => {
    expect(() => applyTheme("light")).not.toThrow();
    expect(document.documentElement).not.toHaveClass("dark");
  });
});

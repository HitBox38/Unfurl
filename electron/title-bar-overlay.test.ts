import { describe, expect, it, vi } from "vitest";

import { DEFAULT_THEME } from "@/shared/hooks/use-theme/constants";

import {
  applyTitleBarOverlay,
  getInitialTitleBarOverlay,
  supportsMutableTitleBarOverlay,
} from "./title-bar-overlay";

describe("title-bar-overlay", () => {
  it("only supports runtime overlay updates on Windows and Linux", () => {
    expect(supportsMutableTitleBarOverlay("win32")).toBe(true);
    expect(supportsMutableTitleBarOverlay("linux")).toBe(true);
    expect(supportsMutableTitleBarOverlay("darwin")).toBe(false);
  });

  it("uses themed overlay colors only where setTitleBarOverlay exists", () => {
    expect(getInitialTitleBarOverlay(DEFAULT_THEME, "win32")).toEqual({
      color: "#18181b",
      symbolColor: "#fafafa",
      height: 32,
    });
    expect(getInitialTitleBarOverlay(DEFAULT_THEME, "darwin")).toEqual({
      height: 32,
    });
  });

  it("skips setTitleBarOverlay on macOS", () => {
    const setTitleBarOverlay = vi.fn();
    const window = { setTitleBarOverlay } as unknown as Electron.BrowserWindow;

    vi.stubGlobal("process", { ...process, platform: "darwin" });
    applyTitleBarOverlay(window, {
      color: "#fafafa",
      symbolColor: "#09090b",
      height: 32,
    });
    vi.unstubAllGlobals();

    expect(setTitleBarOverlay).not.toHaveBeenCalled();
  });

  it("updates the overlay on Windows", () => {
    const setTitleBarOverlay = vi.fn();
    const window = { setTitleBarOverlay } as unknown as Electron.BrowserWindow;
    const options = {
      color: "#fafafa",
      symbolColor: "#09090b",
      height: 32,
    };

    vi.stubGlobal("process", { ...process, platform: "win32" });
    applyTitleBarOverlay(window, options);
    vi.unstubAllGlobals();

    expect(setTitleBarOverlay).toHaveBeenCalledWith(options);
  });
});

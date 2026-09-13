import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createPreference } from "@/shared/lib/preference-store";
import { usePreference } from "@/shared/hooks/use-preference";
import { useTheme, useThemeSync } from "@/shared/hooks/use-theme";
import { initTheme } from "@/shared/hooks/use-theme/helpers";
import { sidebarPreference } from "@/features/settings/hooks/use-settings-preferences";
import { useSidebarStartup } from "@/features/settings/hooks/use-sidebar-startup";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window, "ipcRenderer");
});

const mockMedia = (initial: boolean) => {
  let matches = initial;
  const listeners = new Set<() => void>();
  vi.stubGlobal("matchMedia", () => ({
    get matches() {
      return matches;
    },
    addEventListener: (_name: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_name: string, cb: () => void) =>
      listeners.delete(cb),
  }));
  return {
    listeners,
    change: (value: boolean) =>
      act(() => {
        matches = value;
        listeners.forEach((cb) => cb());
      }),
  };
};

describe("settings persistence", () => {
  it("validates stored data, synchronizes consumers, and preserves the previous value on failed writes", () => {
    const preference = createPreference(
      "test:preference",
      false,
      (v): v is boolean => typeof v === "boolean",
    );
    localStorage.setItem("test:preference", "{bad");
    const first = renderHook(() => usePreference(preference));
    const second = renderHook(() => usePreference(preference));
    expect(first.result.current[0]).toBe(false);
    act(() => first.result.current[1](true));
    expect(second.result.current[0]).toBe(true);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    act(() => first.result.current[1](false));
    expect(first.result.current[2]).toBe(true);
    expect(first.result.current[0]).toBe(true);
    expect(second.result.current[0]).toBe(true);
  });

  it("uses defaults for unsupported values and unavailable storage, and observes other tabs", () => {
    localStorage.setItem("unfurl.sidebar-startup.v1", JSON.stringify("other"));
    const hook = renderHook(() => usePreference(sidebarPreference));
    expect(hook.result.current[0]).toBe("automatic");
    act(() => {
      localStorage.setItem(
        "unfurl.sidebar-startup.v1",
        JSON.stringify("collapsed"),
      );
      window.dispatchEvent(
        new StorageEvent("storage", { key: "unfurl.sidebar-startup.v1" }),
      );
    });
    expect(hook.result.current[0]).toBe("collapsed");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(sidebarPreference.read()).toBe("automatic");
    expect(() => initTheme()).not.toThrow();
  });
});

describe("System theme", () => {
  it("restores selected System theme, follows OS changes, and syncs the desktop title bar", () => {
    const media = mockMedia(false);
    localStorage.setItem("unfurl-theme", JSON.stringify("system"));
    const send = vi.fn();
    Object.defineProperty(window, "ipcRenderer", {
      configurable: true,
      value: { send },
    });
    initTheme();
    expect(document.documentElement).not.toHaveClass("dark");
    const hook = renderHook(() => {
      useThemeSync();
      return useTheme();
    });
    media.change(true);
    expect(hook.result.current.theme).toBe("system");
    expect(hook.result.current.resolvedTheme).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
    expect(send).toHaveBeenLastCalledWith(
      "title-bar-overlay:set",
      expect.objectContaining({ color: "#18181b" }),
    );
    act(() => hook.result.current.setTheme("light"));
    media.change(true);
    expect(document.documentElement).not.toHaveClass("dark");
    hook.unmount();
    expect(media.listeners.size).toBe(0);
    const restored = renderHook(() => useTheme());
    expect(restored.result.current.theme).toBe("light");
  });
});

describe("sidebar startup", () => {
  it("preserves responsive automatic behavior, explicit modes, and session-only toggles", () => {
    const media = mockMedia(true);
    vi.stubGlobal("innerWidth", 1200);
    const hook = renderHook(() => useSidebarStartup(false));
    expect(hook.result.current[0]).toBe(true);
    media.change(false);
    expect(hook.result.current[0]).toBe(false);
    act(() => sidebarPreference.write("expanded"));
    expect(hook.result.current[0]).toBe(true);
    media.change(false);
    expect(hook.result.current[0]).toBe(true);
    act(() => hook.result.current[1](false));
    expect(sidebarPreference.read()).toBe("expanded");
    hook.unmount();
    const restored = renderHook(() => useSidebarStartup(false));
    expect(restored.result.current[0]).toBe(true);
    act(() => sidebarPreference.write("collapsed"));
    expect(restored.result.current[0]).toBe(false);
  });
});

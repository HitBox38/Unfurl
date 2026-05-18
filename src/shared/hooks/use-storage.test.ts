import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { STORAGE_EVENT, useStorage } from "@/shared/hooks/use-storage";

describe("useStorage", () => {
  it("returns the default value when no value is in storage", () => {
    const { result } = renderHook(() =>
      useStorage<{ count: number }>({
        key: "test:default",
        defaultValue: { count: 0 },
      }),
    );
    expect(result.current[0]).toEqual({ count: 0 });
  });

  it("seeds storage with the default value on first read", () => {
    renderHook(() =>
      useStorage<{ count: number }>({
        key: "test:seed",
        defaultValue: { count: 5 },
      }),
    );
    expect(JSON.parse(localStorage.getItem("test:seed")!)).toEqual({
      count: 5,
    });
  });

  it("persists updates and updates state", () => {
    const { result } = renderHook(() =>
      useStorage<{ count: number }>({
        key: "test:update",
        defaultValue: { count: 0 },
      }),
    );
    act(() => result.current[1]({ count: 3 }));
    expect(result.current[0]).toEqual({ count: 3 });
    expect(JSON.parse(localStorage.getItem("test:update")!)).toEqual({
      count: 3,
    });
  });

  it("syncs across hook instances via the storage-change event", () => {
    const first = renderHook(() =>
      useStorage<string>({ key: "test:event", defaultValue: "a" }),
    );
    const second = renderHook(() =>
      useStorage<string>({ key: "test:event", defaultValue: "a" }),
    );
    act(() => {
      window.dispatchEvent(
        new CustomEvent(STORAGE_EVENT, {
          detail: { key: "test:event", newValue: "z" },
        }),
      );
    });
    expect(second.result.current[0]).toBe("z");
    expect(first.result.current[0]).toBe("z");
  });
});

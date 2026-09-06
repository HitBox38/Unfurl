import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useEditableFiles } from "@/shared/hooks/use-editable-files";
import {
  EDITABLE_FILES_STORAGE_KEY,
  deleteEditableFile,
  saveEditableFile,
} from "@/shared/lib/editable-files-storage";
import type { StoryData } from "@/shared/types";

const story: StoryData = { title: null, start: null, nodes: [] };

const seed = (id: string, projectId: string, now: number) =>
  saveEditableFile(
    { name: id, fileType: "twee", content: story, projectId },
    { createId: () => id, now: () => now },
  );

describe("useEditableFiles", () => {
  it("returns every file newest first", () => {
    seed("old", "p1", 1);
    seed("new", "p2", 2);

    const { result } = renderHook(() => useEditableFiles());

    expect(result.current.map((file) => file.id)).toEqual(["new", "old"]);
  });

  it("scopes the list to a project when asked", () => {
    seed("a", "p1", 1);
    seed("b", "p2", 2);

    const { result } = renderHook(() => useEditableFiles("p1"));

    expect(result.current.map((file) => file.id)).toEqual(["a"]);
  });

  it("re-renders when files are saved or deleted in the same window", () => {
    const { result } = renderHook(() => useEditableFiles());
    expect(result.current).toEqual([]);

    act(() => {
      seed("a", "p1", 1);
    });
    expect(result.current.map((file) => file.id)).toEqual(["a"]);

    act(() => {
      deleteEditableFile("a");
    });
    expect(result.current).toEqual([]);
  });

  it("re-reads storage when another window changes the key", () => {
    const { result } = renderHook(() => useEditableFiles());

    act(() => {
      localStorage.setItem(
        EDITABLE_FILES_STORAGE_KEY,
        JSON.stringify([
          { id: "x", name: "x", fileType: "twee", content: story, updatedAt: 1, projectId: "p1" },
        ]),
      );
      window.dispatchEvent(
        new StorageEvent("storage", { key: EDITABLE_FILES_STORAGE_KEY }),
      );
    });

    expect(result.current.map((file) => file.id)).toEqual(["x"]);
  });
});

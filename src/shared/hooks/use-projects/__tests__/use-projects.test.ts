import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useProject, useProjects } from "@/shared/hooks/use-projects";
import {
  createProject,
  renameProject,
} from "@/shared/lib/projects-storage";

describe("useProjects", () => {
  it("returns projects in creation order and follows new projects", () => {
    createProject({ name: "first" }, { createId: () => "a", now: () => 1 });

    const { result } = renderHook(() => useProjects());
    expect(result.current.map((project) => project.id)).toEqual(["a"]);

    act(() => {
      createProject({ name: "second" }, { createId: () => "b", now: () => 2 });
    });

    expect(result.current.map((project) => project.id)).toEqual(["a", "b"]);
  });
});

describe("useProject", () => {
  it("returns null for an unknown id", () => {
    const { result } = renderHook(() => useProject("missing"));

    expect(result.current).toBeNull();
  });

  it("follows renames of the requested project", () => {
    createProject({ name: "before" }, { createId: () => "p" });

    const { result } = renderHook(() => useProject("p"));
    expect(result.current?.name).toBe("before");

    act(() => {
      renameProject("p", "after");
    });

    expect(result.current?.name).toBe("after");
  });

  it("returns null when no id is given", () => {
    const { result } = renderHook(() => useProject(null));

    expect(result.current).toBeNull();
  });
});

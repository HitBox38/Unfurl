import { describe, expect, it, vi } from "vitest";

import { STORAGE_EVENT } from "@/shared/hooks/use-storage";
import {
  listEditableFiles,
  saveEditableFile,
} from "@/shared/lib/editable-files-storage";
import {
  PROJECTS_STORAGE_KEY,
  createProject,
  deleteProject,
  getProject,
  listProjects,
  renameProject,
  updateProjectMetadataConfig,
} from "@/shared/lib/projects-storage";
import type { MetadataConfigTemplate, StoryData } from "@/shared/types";

const story: StoryData = { title: "Story", start: null, nodes: [] };

const metadataConfig: MetadataConfigTemplate = {
  config: [{ name: "gold", sign: "$", type: "number", label: "Gold" }],
};

describe("projects storage", () => {
  it("creates a local project with an empty metadata config", () => {
    const project = createProject(
      { name: "  My RPG  " },
      { now: () => 100, createId: () => "rpg" },
    );

    expect(project).toEqual({
      id: "rpg",
      name: "My RPG",
      source: { kind: "local" },
      metadataConfig: { config: [] },
      createdAt: 100,
      updatedAt: 100,
    });
    expect(getProject("rpg")).toEqual(project);
  });

  it("falls back to an untitled name when the name is blank", () => {
    const project = createProject({ name: "   " });

    expect(project.name).toBe("Untitled project");
  });

  it("stores a provided metadata config on creation", () => {
    const project = createProject({ name: "RPG", metadataConfig });

    expect(getProject(project.id)?.metadataConfig).toEqual(metadataConfig);
  });

  it("lists projects in creation order", () => {
    createProject({ name: "second" }, { now: () => 200, createId: () => "b" });
    createProject({ name: "first" }, { now: () => 100, createId: () => "a" });

    expect(listProjects().map((project) => project.id)).toEqual(["a", "b"]);
  });

  it("returns null for an unknown project", () => {
    expect(getProject("missing")).toBeNull();
  });

  it("renames a project and bumps its updatedAt", () => {
    createProject({ name: "old" }, { now: () => 100, createId: () => "p" });

    renameProject("p", "  new  ", { now: () => 500 });

    expect(getProject("p")).toMatchObject({
      name: "new",
      createdAt: 100,
      updatedAt: 500,
    });
  });

  it("ignores blank names when renaming", () => {
    createProject({ name: "keep" }, { now: () => 100, createId: () => "p" });

    renameProject("p", "   ", { now: () => 500 });

    expect(getProject("p")).toMatchObject({ name: "keep", updatedAt: 100 });
  });

  it("updates the metadata config of a project", () => {
    createProject({ name: "RPG" }, { now: () => 100, createId: () => "p" });

    updateProjectMetadataConfig("p", metadataConfig, { now: () => 700 });

    expect(getProject("p")).toMatchObject({
      metadataConfig,
      updatedAt: 700,
    });
  });

  it("deletes a project together with its files only", () => {
    createProject({ name: "keep" }, { createId: () => "keep" });
    createProject({ name: "gone" }, { createId: () => "gone" });
    saveEditableFile(
      { name: "kept file", fileType: "twee", content: story, projectId: "keep" },
      { createId: () => "f-keep" },
    );
    saveEditableFile(
      { name: "gone file", fileType: "twee", content: story, projectId: "gone" },
      { createId: () => "f-gone" },
    );

    deleteProject("gone");

    expect(listProjects().map((project) => project.id)).toEqual(["keep"]);
    expect(listEditableFiles().map((file) => file.id)).toEqual(["f-keep"]);
  });

  it("refuses to delete the only project", () => {
    createProject({ name: "only" }, { createId: () => "only" });

    expect(() => deleteProject("only")).toThrowError(/only project/i);
    expect(listProjects()).toHaveLength(1);
  });

  it("notifies same-window listeners when projects change", () => {
    const listener = vi.fn();
    window.addEventListener(STORAGE_EVENT, listener);

    createProject({ name: "RPG" }, { createId: () => "p" });

    window.removeEventListener(STORAGE_EVENT, listener);
    const event = listener.mock.calls[0]?.[0] as CustomEvent<{
      key: string;
      newValue: unknown[];
    }>;
    expect(event.detail.key).toBe(PROJECTS_STORAGE_KEY);
    expect(event.detail.newValue).toHaveLength(1);
  });

  it("recovers from corrupt storage by starting empty", () => {
    localStorage.setItem(PROJECTS_STORAGE_KEY, "{not json");

    expect(listProjects()).toEqual([]);
    expect(localStorage.getItem(PROJECTS_STORAGE_KEY)).toBeNull();
  });
});

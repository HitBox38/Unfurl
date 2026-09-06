import { describe, expect, it } from "vitest";

import {
  EDITABLE_FILES_STORAGE_KEY,
  getEditableFile,
} from "@/shared/lib/editable-files-storage";
import {
  DEFAULT_PROJECT_NAME,
  LEGACY_METADATA_CONFIG_KEY,
  PROJECTS_STORAGE_KEY,
  createProject,
  listProjects,
  migrateStorage,
} from "@/shared/lib/projects-storage";
import type { MetadataConfigTemplate, StoryData } from "@/shared/types";

const story: StoryData = { title: null, start: null, nodes: [] };

const legacyConfig: MetadataConfigTemplate = {
  config: [{ name: "gold", sign: "$", type: "number", label: "Gold" }],
};

const seedLegacyFiles = () =>
  localStorage.setItem(
    EDITABLE_FILES_STORAGE_KEY,
    JSON.stringify([
      { id: "one", name: "one", fileType: "twee", content: story, updatedAt: 1 },
      { id: "two", name: "two", fileType: "json", content: story, updatedAt: 2 },
    ]),
  );

describe("migrateStorage", () => {
  it("creates a default project on a fresh profile", () => {
    const projects = migrateStorage({ now: () => 42, createId: () => "default" });

    expect(projects).toEqual([
      {
        id: "default",
        name: DEFAULT_PROJECT_NAME,
        source: { kind: "local" },
        metadataConfig: { config: [] },
        createdAt: 42,
        updatedAt: 42,
      },
    ]);
    expect(listProjects()).toEqual(projects);
  });

  it("moves the legacy global metadata config into the default project", () => {
    localStorage.setItem(LEGACY_METADATA_CONFIG_KEY, JSON.stringify(legacyConfig));

    const [project] = migrateStorage();

    expect(project.metadataConfig).toEqual(legacyConfig);
    expect(localStorage.getItem(LEGACY_METADATA_CONFIG_KEY)).toBeNull();
  });

  it("assigns legacy files to the default project", () => {
    seedLegacyFiles();

    const [project] = migrateStorage();

    expect(getEditableFile("one")?.projectId).toBe(project.id);
    expect(getEditableFile("two")?.projectId).toBe(project.id);
  });

  it("is idempotent", () => {
    seedLegacyFiles();
    localStorage.setItem(LEGACY_METADATA_CONFIG_KEY, JSON.stringify(legacyConfig));

    migrateStorage({ createId: () => "default" });
    const projectsSnapshot = localStorage.getItem(PROJECTS_STORAGE_KEY);
    const filesSnapshot = localStorage.getItem(EDITABLE_FILES_STORAGE_KEY);

    migrateStorage({ createId: () => "should-not-be-used" });

    expect(localStorage.getItem(PROJECTS_STORAGE_KEY)).toBe(projectsSnapshot);
    expect(localStorage.getItem(EDITABLE_FILES_STORAGE_KEY)).toBe(filesSnapshot);
    expect(listProjects()).toHaveLength(1);
  });

  it("repairs files that point at a project which no longer exists", () => {
    createProject({ name: "kept" }, { createId: () => "kept" });
    localStorage.setItem(
      EDITABLE_FILES_STORAGE_KEY,
      JSON.stringify([
        {
          id: "orphan",
          name: "orphan",
          fileType: "twee",
          content: story,
          updatedAt: 1,
          projectId: "vanished",
        },
      ]),
    );

    migrateStorage();

    expect(getEditableFile("orphan")?.projectId).toBe("kept");
    expect(listProjects()).toHaveLength(1);
  });

  it("recreates a default project when the project list is empty", () => {
    localStorage.setItem(PROJECTS_STORAGE_KEY, "[]");

    const projects = migrateStorage();

    expect(projects).toHaveLength(1);
    expect(projects[0].name).toBe(DEFAULT_PROJECT_NAME);
  });

  it("drops an unreadable legacy metadata config instead of failing", () => {
    localStorage.setItem(LEGACY_METADATA_CONFIG_KEY, "{broken");

    const [project] = migrateStorage();

    expect(project.metadataConfig).toEqual({ config: [] });
    expect(localStorage.getItem(LEGACY_METADATA_CONFIG_KEY)).toBeNull();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import { createProject, getProject, PROJECTS_STORAGE_KEY } from "@/shared/lib/projects-storage";
import { EDITABLE_FILES_STORAGE_KEY, getEditableFile, saveEditableFile, updateEditableFileContent } from "@/shared/lib/editable-files-storage";
import { applyMetadataRefactor, createMetadataEdits, getMetadataUndo, planMetadataRefactor, recoverMetadataTransaction, undoMetadataRefactor } from "@/shared/lib/project-metadata-refactor";
import { metadataTransactionKey } from "@/shared/lib/project-metadata-refactor/helpers";
import { ideMetadata, makeIdeStory } from "@/test/fixtures/story-ide";

describe("project metadata refactors", () => {
  beforeEach(() => {
    createProject({ name: "Game", metadataConfig: ideMetadata }, { createId: () => "project" });
    createProject({ name: "Other", metadataConfig: ideMetadata }, { createId: () => "other" });
    for (const id of ["one", "two"]) saveEditableFile({ id, projectId: "project", name: id, fileType: "json", content: makeIdeStory() });
    saveEditableFile({ id: "unrelated", projectId: "other", name: "unrelated", fileType: "json", content: makeIdeStory() });
  });

  it("previews a rename across every story and applies definitions and values together", () => {
    const edits = createMetadataEdits(ideMetadata); edits[0].field!.name = "questReward";
    const plan = planMetadataRefactor("project", edits);
    expect(plan.changes).toHaveLength(8);
    expect(getProject("project")?.metadataConfig).toEqual(ideMetadata);
    expect(getEditableFile("one")?.content.nodes[0].metadata.reward).toBe(100);
    const otherBefore = getEditableFile("unrelated");
    applyMetadataRefactor(plan);
    expect(getProject("project")?.metadataConfig.config[0].name).toBe("questReward");
    for (const id of ["one", "two"]) expect(getEditableFile(id)?.content.nodes.map((node) => node.metadata)).toEqual([{ questReward: 100, visited: false }, { questReward: 100, visited: true }]);
    expect(getEditableFile("unrelated")).toEqual(otherBefore);
    expect(getMetadataUndo("project")).not.toBeNull();
    undoMetadataRefactor("project");
    expect(getProject("project")?.metadataConfig).toEqual(ideMetadata);
    expect(getEditableFile("one")?.content).toEqual(makeIdeStory());
  });

  it("requires explicit conversion and blocks values that have no safe binary conversion", () => {
    const edits = createMetadataEdits(ideMetadata); edits[1].field!.type = "number"; edits[1].defaultValue = 0;
    expect(planMetadataRefactor("project", edits).errors.length).toBeGreaterThan(0);
    edits[1].conversion = "binary";
    const plan = planMetadataRefactor("project", edits);
    expect(plan.errors).toEqual([]);
    expect(plan.nextFiles[0].content.nodes.map((node) => node.metadata.visited)).toEqual([0, 1]);
    edits[0].field!.type = "boolean"; edits[0].defaultValue = false; edits[0].conversion = "binary";
    expect(planMetadataRefactor("project", edits).errors.length).toBeGreaterThan(0);
  });

  it("previews removal and fills newly defined fields while retaining existing matching values", () => {
    const edits = createMetadataEdits(ideMetadata); edits[1].field = null;
    edits.push({ id: "new", originalName: null, field: { name: "flag", type: "boolean", sign: "#flag" }, defaultValue: true, conversion: "none" });
    const plan = planMetadataRefactor("project", edits);
    expect(plan.errors).toEqual([]);
    expect(plan.nextFiles[0].content.nodes[0].metadata).toEqual({ reward: 100, flag: true });
    applyMetadataRefactor(plan);
    expect(getEditableFile("two")?.content.nodes[1].metadata).toEqual({ reward: 100, flag: true });
  });

  it("rejects rename collisions and duplicate definitions without touching storage", () => {
    const story = makeIdeStory(); story.nodes[0].metadata.questReward = 5; updateEditableFileContent("one", story);
    const edits = createMetadataEdits(ideMetadata); edits[0].field!.name = "questReward";
    const before = localStorage.getItem(EDITABLE_FILES_STORAGE_KEY);
    const plan = planMetadataRefactor("project", edits);
    expect(plan.errors.some((error) => error.includes("collision"))).toBe(true);
    expect(() => applyMetadataRefactor(plan)).toThrow();
    expect(localStorage.getItem(EDITABLE_FILES_STORAGE_KEY)).toBe(before);
    edits[0].field!.name = "visited";
    expect(planMetadataRefactor("project", edits).errors.some((error) => error.includes("Duplicate"))).toBe(true);
  });

  it("refuses a stale preview and an undo that would overwrite subsequent work", () => {
    const edits = createMetadataEdits(ideMetadata); edits[0].field!.name = "questReward";
    const stale = planMetadataRefactor("project", edits);
    const story = makeIdeStory(); story.nodes[0].content = ["Later edit"];
    updateEditableFileContent("one", story);
    expect(() => applyMetadataRefactor(stale)).toThrow(/changed/i);
    applyMetadataRefactor(planMetadataRefactor("project", edits));
    const applied = getEditableFile("one")!.content;
    updateEditableFileContent("one", { ...applied, title: "Another later edit" });
    expect(() => undoMetadataRefactor("project")).toThrow(/changed/i);
    expect(getEditableFile("one")?.content.title).toBe("Another later edit");
  });

  it("rolls back all writes when one storage key fails", () => {
    const edits = createMetadataEdits(ideMetadata); edits[0].field!.name = "questReward";
    const plan = planMetadataRefactor("project", edits);
    const beforeFiles = localStorage.getItem(EDITABLE_FILES_STORAGE_KEY);
    const beforeProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
    const originalSetItem = Storage.prototype.setItem;
    let failed = false;
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
      if (key === PROJECTS_STORAGE_KEY && !failed) { failed = true; throw new Error("Storage full"); }
      originalSetItem.call(this, key, value);
    });
    try {
      expect(() => applyMetadataRefactor(plan)).toThrow("Storage full");
      expect(localStorage.getItem(EDITABLE_FILES_STORAGE_KEY)).toBe(beforeFiles);
      expect(localStorage.getItem(PROJECTS_STORAGE_KEY)).toBe(beforeProjects);
      expect(getMetadataUndo("project")).toBeNull();
      expect(localStorage.getItem(metadataTransactionKey)).toBeNull();
    } finally { spy.mockRestore(); }
  });

  it("recovers the original project and stories after an interrupted transaction", () => {
    const beforeFiles = localStorage.getItem(EDITABLE_FILES_STORAGE_KEY);
    const beforeProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
    localStorage.setItem(metadataTransactionKey, JSON.stringify({ version: 1, before: { [EDITABLE_FILES_STORAGE_KEY]: beforeFiles, [PROJECTS_STORAGE_KEY]: beforeProjects }, after: { [EDITABLE_FILES_STORAGE_KEY]: "[]", [PROJECTS_STORAGE_KEY]: "[]" } }));
    localStorage.setItem(EDITABLE_FILES_STORAGE_KEY, "[]");
    recoverMetadataTransaction();
    expect(localStorage.getItem(EDITABLE_FILES_STORAGE_KEY)).toBe(beforeFiles);
    expect(localStorage.getItem(PROJECTS_STORAGE_KEY)).toBe(beforeProjects);
    expect(localStorage.getItem(metadataTransactionKey)).toBeNull();
  });
});

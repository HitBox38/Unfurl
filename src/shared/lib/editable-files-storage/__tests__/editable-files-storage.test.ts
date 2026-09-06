import { describe, expect, it } from "vitest";

import {
  deleteEditableFile,
  deleteEditableFilesByProject,
  getEditableFile,
  listEditableFiles,
  listEditableFilesByProject,
  moveEditableFile,
  repairFileProjectIds,
  saveEditableFile,
  searchEditableFiles,
  updateEditableFileContent,
  updateEditableFileName,
  EDITABLE_FILES_STORAGE_KEY,
} from "@/shared/lib/editable-files-storage";
import type { StoryData } from "@/shared/types";

const firstStory: StoryData = {
  title: "First Story",
  start: "Start",
  nodes: [
    {
      name: "Start",
      content: ["Hello"],
      choices: [],
      metadata: {},
    },
  ],
};

const secondStory: StoryData = {
  title: "Second Story",
  start: "Intro",
  nodes: [
    {
      name: "Intro",
      content: ["Hi"],
      choices: [],
      metadata: {},
    },
  ],
};

const PROJECT = "project-a";
const OTHER_PROJECT = "project-b";

describe("recent editable file storage", () => {
  it("stores editable files newest first", () => {
    const storage = localStorage;

    const first = saveEditableFile(
      { name: "alpha", fileType: "twee", content: firstStory, projectId: PROJECT },
      { storage, now: () => 100, createId: () => "first" },
    );
    const second = saveEditableFile(
      { name: "beta", fileType: "json", content: secondStory, projectId: PROJECT },
      { storage, now: () => 200, createId: () => "second" },
    );

    expect(first.id).toBe("first");
    expect(first.projectId).toBe(PROJECT);
    expect(listEditableFiles({ storage }).map((file) => file.id)).toEqual([
      second.id,
      first.id,
    ]);
  });

  it("updates an existing editable file instead of duplicating it", () => {
    const storage = localStorage;

    saveEditableFile(
      { name: "draft", fileType: "twee", content: firstStory, projectId: PROJECT },
      { storage, now: () => 100, createId: () => "draft-id" },
    );
    saveEditableFile(
      {
        id: "draft-id",
        name: "renamed draft",
        fileType: "json",
        content: secondStory,
        projectId: PROJECT,
      },
      { storage, now: () => 300, createId: () => "unused" },
    );

    const files = listEditableFiles({ storage });
    expect(files).toHaveLength(1);
    expect(files[0]).toMatchObject({
      id: "draft-id",
      name: "renamed draft",
      fileType: "json",
      updatedAt: 300,
      content: secondStory,
    });
  });

  it("searches editable files by name and title case-insensitively", () => {
    const storage = localStorage;

    saveEditableFile(
      { name: "lorcan", fileType: "twee", content: firstStory, projectId: PROJECT },
      { storage, now: () => 100, createId: () => "first" },
    );
    saveEditableFile(
      { name: "archive", fileType: "json", content: secondStory, projectId: PROJECT },
      { storage, now: () => 200, createId: () => "second" },
    );

    expect(searchEditableFiles("LOR", { storage })).toHaveLength(1);
    expect(searchEditableFiles("second story", { storage })).toHaveLength(1);
    expect(searchEditableFiles("missing", { storage })).toHaveLength(0);
  });

  it("persists edited content for an existing editable file", () => {
    const storage = localStorage;

    saveEditableFile(
      { name: "draft", fileType: "twee", content: firstStory, projectId: PROJECT },
      { storage, now: () => 100, createId: () => "draft-id" },
    );

    const editedStory: StoryData = {
      ...firstStory,
      nodes: [
        {
          ...firstStory.nodes[0],
          content: ["Edited"],
        },
      ],
    };

    updateEditableFileContent("draft-id", editedStory, {
      storage,
      now: () => 500,
    });

    expect(getEditableFile("draft-id", { storage })?.content).toEqual(
      editedStory,
    );
    expect(getEditableFile("draft-id", { storage })?.updatedAt).toBe(500);
  });

  it("persists renamed editable files without changing content", () => {
    const storage = localStorage;

    saveEditableFile(
      { name: "draft", fileType: "twee", content: firstStory, projectId: PROJECT },
      { storage, now: () => 100, createId: () => "draft-id" },
    );

    updateEditableFileName("draft-id", "renamed draft", {
      storage,
      now: () => 600,
    });

    expect(getEditableFile("draft-id", { storage })).toMatchObject({
      id: "draft-id",
      name: "renamed draft",
      content: firstStory,
      updatedAt: 600,
    });
  });

  it("lists only the files of the requested project, newest first", () => {
    saveEditableFile(
      { name: "a", fileType: "twee", content: firstStory, projectId: PROJECT },
      { now: () => 100, createId: () => "a" },
    );
    saveEditableFile(
      { name: "b", fileType: "twee", content: firstStory, projectId: OTHER_PROJECT },
      { now: () => 200, createId: () => "b" },
    );
    saveEditableFile(
      { name: "c", fileType: "twee", content: firstStory, projectId: PROJECT },
      { now: () => 300, createId: () => "c" },
    );

    expect(listEditableFilesByProject(PROJECT).map((file) => file.id)).toEqual([
      "c",
      "a",
    ]);
  });

  it("deletes a single editable file", () => {
    saveEditableFile(
      { name: "a", fileType: "twee", content: firstStory, projectId: PROJECT },
      { createId: () => "a" },
    );
    saveEditableFile(
      { name: "b", fileType: "twee", content: firstStory, projectId: PROJECT },
      { createId: () => "b" },
    );

    deleteEditableFile("a");

    expect(listEditableFiles().map((file) => file.id)).toEqual(["b"]);
    expect(getEditableFile("a")).toBeNull();
  });

  it("deletes every file that belongs to a project", () => {
    saveEditableFile(
      { name: "a", fileType: "twee", content: firstStory, projectId: PROJECT },
      { createId: () => "a" },
    );
    saveEditableFile(
      { name: "b", fileType: "twee", content: firstStory, projectId: OTHER_PROJECT },
      { createId: () => "b" },
    );

    deleteEditableFilesByProject(PROJECT);

    expect(listEditableFiles().map((file) => file.id)).toEqual(["b"]);
  });

  it("moves a file to another project and bumps its updatedAt", () => {
    saveEditableFile(
      { name: "a", fileType: "twee", content: firstStory, projectId: PROJECT },
      { now: () => 100, createId: () => "a" },
    );

    moveEditableFile("a", OTHER_PROJECT, { now: () => 900 });

    expect(getEditableFile("a")).toMatchObject({
      projectId: OTHER_PROJECT,
      updatedAt: 900,
    });
  });

  it("reassigns files with missing or unknown project ids to the fallback project", () => {
    localStorage.setItem(
      EDITABLE_FILES_STORAGE_KEY,
      JSON.stringify([
        { id: "legacy", name: "legacy", fileType: "twee", content: firstStory, updatedAt: 1 },
        { id: "orphan", name: "orphan", fileType: "twee", content: firstStory, updatedAt: 2, projectId: "deleted" },
        { id: "fine", name: "fine", fileType: "twee", content: firstStory, updatedAt: 3, projectId: PROJECT },
      ]),
    );

    const repaired = repairFileProjectIds([PROJECT], PROJECT);

    expect(repaired).toBe(2);
    expect(getEditableFile("legacy")?.projectId).toBe(PROJECT);
    expect(getEditableFile("orphan")?.projectId).toBe(PROJECT);
    expect(getEditableFile("fine")).toMatchObject({ projectId: PROJECT, updatedAt: 3 });
  });

  it("does not rewrite storage when every file already has a valid project", () => {
    saveEditableFile(
      { name: "a", fileType: "twee", content: firstStory, projectId: PROJECT },
      { now: () => 100, createId: () => "a" },
    );
    const before = localStorage.getItem(EDITABLE_FILES_STORAGE_KEY);

    expect(repairFileProjectIds([PROJECT], PROJECT)).toBe(0);
    expect(localStorage.getItem(EDITABLE_FILES_STORAGE_KEY)).toBe(before);
  });
});

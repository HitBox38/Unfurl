import { describe, expect, it } from "vitest";

import {
  getEditableFile,
  listEditableFiles,
  saveEditableFile,
  searchEditableFiles,
  updateEditableFileContent,
  updateEditableFileName,
} from "@/features/recent-files";
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

describe("recent editable file storage", () => {
  it("stores editable files newest first", () => {
    const storage = localStorage;

    const first = saveEditableFile(
      { name: "alpha", fileType: "twee", content: firstStory },
      { storage, now: () => 100, createId: () => "first" },
    );
    const second = saveEditableFile(
      { name: "beta", fileType: "json", content: secondStory },
      { storage, now: () => 200, createId: () => "second" },
    );

    expect(first.id).toBe("first");
    expect(listEditableFiles({ storage }).map((file) => file.id)).toEqual([
      second.id,
      first.id,
    ]);
  });

  it("updates an existing editable file instead of duplicating it", () => {
    const storage = localStorage;

    saveEditableFile(
      { name: "draft", fileType: "twee", content: firstStory },
      { storage, now: () => 100, createId: () => "draft-id" },
    );
    saveEditableFile(
      {
        id: "draft-id",
        name: "renamed draft",
        fileType: "json",
        content: secondStory,
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
      { name: "lorcan", fileType: "twee", content: firstStory },
      { storage, now: () => 100, createId: () => "first" },
    );
    saveEditableFile(
      { name: "archive", fileType: "json", content: secondStory },
      { storage, now: () => 200, createId: () => "second" },
    );

    expect(searchEditableFiles("LOR", { storage })).toHaveLength(1);
    expect(searchEditableFiles("second story", { storage })).toHaveLength(1);
    expect(searchEditableFiles("missing", { storage })).toHaveLength(0);
  });

  it("persists edited content for an existing editable file", () => {
    const storage = localStorage;

    saveEditableFile(
      { name: "draft", fileType: "twee", content: firstStory },
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
      { name: "draft", fileType: "twee", content: firstStory },
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
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import { evaluateDraft, serializeNode } from "@/features/story-ide/draft";
import { useStoryIdeStore, workspaceStorageKey } from "@/features/story-ide/hooks/use-story-ide-store";
import { createProject } from "@/shared/lib/projects-storage";
import { workspaceViewKey } from "@/shared/lib/story-ide-storage";
import { deleteEditableFile, deleteEditableFilesByProject, getEditableFile, saveEditableFile, updateEditableFileContent } from "@/shared/lib/editable-files-storage";
import { ideMetadata, makeIdeStory } from "@/test/fixtures/story-ide";

describe("IDE draft recovery", () => {
  beforeEach(() => {
    useStoryIdeStore.setState({ workspaces: {}, storageError: null });
    createProject({ name: "Game", metadataConfig: ideMetadata }, { createId: () => "project" });
    saveEditableFile({ id: "file", projectId: "project", name: "quest", fileType: "json", content: makeIdeStory() });
  });

  it("stores view preferences without duplicating a clean story, and releases applied or discarded drafts", () => {
    const story = makeIdeStory(); const actions = useStoryIdeStore.getState(); actions.initialize("file", story);
    const id = useStoryIdeStore.getState().workspaces.file.documents[1].id;
    actions.selectDocument("file", id); actions.setMode("file", "ide"); actions.setSearch("file", { query: "coins" });
    expect(localStorage.getItem(workspaceStorageKey("file"))).toBeNull();
    useStoryIdeStore.setState({ workspaces: {} }); actions.initialize("file", story);
    expect(useStoryIdeStore.getState().workspaces.file).toMatchObject({ mode: "ide", search: { query: "coins" } });
    expect(useStoryIdeStore.getState().workspaces.file.activeId).toBe(id);
    actions.editDocument("file", id, "{ pending");
    expect(localStorage.getItem(workspaceStorageKey("file"))).not.toBeNull();
    actions.reset("file", story);
    expect(localStorage.getItem(workspaceStorageKey("file"))).toBeNull();
  });

  it.each(["file", "project"])("removes recovery data when the %s is deleted", (kind) => {
    const actions = useStoryIdeStore.getState(); actions.initialize("file", makeIdeStory());
    actions.editDocument("file", useStoryIdeStore.getState().workspaces.file.documents[0].id, "{ pending");
    if (kind === "file") deleteEditableFile("file"); else deleteEditableFilesByProject("project");
    expect(localStorage.getItem(workspaceStorageKey("file"))).toBeNull();
    expect(localStorage.getItem(workspaceViewKey("file"))).toBeNull();
    actions.setMode("file", "ide");
    expect(localStorage.getItem(workspaceStorageKey("file"))).toBeNull();
    expect(localStorage.getItem(workspaceViewKey("file"))).toBeNull();
  });

  it("recovers invalid source, tabs, search, and view without modifying the saved file", () => {
    const story = makeIdeStory(); const actions = useStoryIdeStore.getState(); actions.initialize("file", story);
    const ids = useStoryIdeStore.getState().workspaces.file.documents.map((document) => document.id);
    actions.selectDocument("file", ids[1]); actions.setMode("file", "ide"); actions.setSearch("file", { scope: "metadata", field: "reward", query: "100" });
    actions.editDocument("file", ids[0], "{ incomplete draft");
    expect(getEditableFile("file")?.content).toEqual(story);
    const raw = localStorage.getItem(workspaceStorageKey("file")); expect(raw).toContain("incomplete draft");
    useStoryIdeStore.setState({ workspaces: {} });
    useStoryIdeStore.getState().initialize("file", getEditableFile("file")!.content);
    const recovered = useStoryIdeStore.getState().workspaces.file;
    expect(recovered.documents[0].text).toBe("{ incomplete draft"); expect(recovered.activeId).toBe(ids[1]); expect(recovered.tabs).toEqual(ids);
    expect(recovered.mode).toBe("ide"); expect(recovered.search).toMatchObject({ scope: "metadata", field: "reward", query: "100" });
    expect(recovered.lastValid).toEqual(story);
  });

  it("shows independently saved changes in the recovered source and preserves a pending correction", () => {
    const story = makeIdeStory(); const actions = useStoryIdeStore.getState(); actions.initialize("file", story);
    const id = useStoryIdeStore.getState().workspaces.file.documents[0].id;
    actions.editDocument("file", id, serializeNode({ ...story.nodes[0], metadata: { reward: 25, visited: false } }));
    const saved = makeIdeStory(); saved.nodes[0].content = ["A designer updated the line"];
    saved.nodes.push({ name: "New saved node", content: [], choices: [], metadata: {} });
    updateEditableFileContent("file", saved);
    useStoryIdeStore.setState({ workspaces: {} }); actions.initialize("file", saved);
    const recovered = useStoryIdeStore.getState().workspaces.file;
    const parsed = JSON.parse(recovered.documents[0].text);
    expect(parsed.content).toEqual(saved.nodes[0].content); expect(parsed.metadata.reward).toBe(25);
    expect(recovered.documents).toHaveLength(3);
    expect(evaluateDraft(recovered, saved, ideMetadata).conflicts).toEqual([]);
  });

  it("preserves unreadable recovery data before a later edit replaces its key", () => {
    const key = workspaceStorageKey("file"); const unreadable = "{ unreadable recovery data";
    localStorage.setItem(key, unreadable);
    const originalSetItem = Storage.prototype.setItem;
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, itemKey, value) {
      if (itemKey.includes(":unreadable:")) throw new Error("Storage full");
      originalSetItem.call(this, itemKey, value);
    });
    try {
      const actions = useStoryIdeStore.getState(); actions.initialize("file", makeIdeStory());
      actions.setMode("file", "ide");
      expect(localStorage.getItem(key)).toBe(unreadable);
      expect(useStoryIdeStore.getState().storageError).not.toBeNull();
    } finally { spy.mockRestore(); }
    useStoryIdeStore.getState().setMode("file", "ide");
    const archivedKey = Object.keys(localStorage).find((itemKey) => itemKey.startsWith(`${key}:unreadable:`));
    expect(archivedKey).toBeDefined(); expect(localStorage.getItem(archivedKey!)).toBe(unreadable);
    expect(localStorage.getItem(key)).toBeNull();
    expect(JSON.parse(localStorage.getItem(workspaceViewKey("file"))!).mode).toBe("ide");
  });
});

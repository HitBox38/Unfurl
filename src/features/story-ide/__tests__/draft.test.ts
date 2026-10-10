import { describe, expect, it } from "vitest";

import { canApplyDraft, createWorkspace, draftChanges, evaluateDraft, parseDocument, rebaseWorkspace, serializeNode, stageDocuments, workspaceHasChanges } from "@/features/story-ide/draft";
import type { IdeWorkspace } from "@/features/story-ide/types";
import type { StoryNode } from "@/shared/types";
import { ideMetadata, makeIdeStory } from "@/test/fixtures/story-ide";

const edit = (workspace: IdeWorkspace, index: number, change: Partial<StoryNode>) => stageDocuments(workspace, workspace.documents.map((document, i) => i === index ? { ...document, text: serializeNode({ ...JSON.parse(document.text), ...change }) } : document));

describe("story IDE drafts", () => {
  it("keeps saved data unchanged while composing a multi-node fix", () => {
    const story = makeIdeStory();
    const workspace = edit(edit(createWorkspace("file", story), 0, { metadata: { reward: 25, visited: false } }), 1, { metadata: { reward: 25, visited: true } });
    const result = evaluateDraft(workspace, story, ideMetadata);
    expect(story.nodes.map((node) => node.metadata.reward)).toEqual([100, 100]);
    expect(result.story?.nodes.map((node) => node.metadata.reward)).toEqual([25, 25]);
    expect(canApplyDraft(result)).toBe(true);
    expect(workspaceHasChanges(workspace)).toBe(true);
  });

  it("ignores formatting and object-key order as story changes", () => {
    const story = makeIdeStory();
    const workspace = createWorkspace("file", story);
    workspace.documents[0].text = JSON.stringify({ ...story.nodes[0], metadata: { visited: false, reward: 100 } });
    expect(workspaceHasChanges(workspace)).toBe(false);
    expect(evaluateDraft(workspace, story, ideMetadata).story).toEqual(story);
  });

  it("warns about pre-existing unresolved links without blocking an unrelated fix", () => {
    const story = makeIdeStory();
    story.nodes[1].choices.push({ text: "Later", destination: "Unwritten" });
    const workspace = edit(createWorkspace("file", story), 0, { metadata: { reward: 50, visited: false } });
    const result = evaluateDraft(workspace, story, ideMetadata);
    expect(canApplyDraft(result)).toBe(true);
    expect(result.issues).toContainEqual(expect.objectContaining({ severity: "warning", message: expect.stringContaining("Unwritten") }));
  });

  it("blocks new dangling links and validates repairs across the combined fix", () => {
    const story = makeIdeStory();
    const workspace = edit(createWorkspace("file", story), 0, { choices: [{ text: "Next", destination: "New" }] });
    expect(canApplyDraft(evaluateDraft(workspace, story, ideMetadata))).toBe(false);
    workspace.documents.push({ id: "new", originalName: null, text: serializeNode({ name: "New", content: [], choices: [], metadata: {} }) });
    expect(canApplyDraft(evaluateDraft(workspace, story, ideMetadata))).toBe(true);
  });

  it("rejects malformed JSON, duplicate properties, unknown fields, and invalid scalar types", () => {
    const story = makeIdeStory();
    const document = createWorkspace("file", story).documents[0];
    for (const text of ["{", document.text.replace('"reward": 100', '"reward": 100, "reward": 200'), JSON.stringify({ ...story.nodes[0], script: "run()" }), JSON.stringify({ ...story.nodes[0], metadata: { reward: "100" } }), JSON.stringify({ ...story.nodes[0], content: [123] })]) {
      expect(parseDocument({ ...document, text }).node).toBeNull();
    }
  });

  it("blocks new duplicate names and unconfigured metadata fields", () => {
    const story = makeIdeStory();
    expect(canApplyDraft(evaluateDraft(edit(createWorkspace("file", story), 0, { name: "Outro" }), story, ideMetadata))).toBe(false);
    const workspace = edit(createWorkspace("file", story), 0, { metadata: { reward: 100, visited: false, newFlag: true } });
    expect(evaluateDraft(workspace, story, ideMetadata).issues).toContainEqual(expect.objectContaining({ severity: "error", path: ["metadata", "newFlag"] }));
  });

  it("preserves existing unconfigured values as warnings", () => {
    const story = makeIdeStory(); story.nodes[0].metadata.legacy = 7;
    const workspace = edit(createWorkspace("file", story), 1, { content: ["Fixed"] });
    const result = evaluateDraft(workspace, story, ideMetadata);
    expect(canApplyDraft(result)).toBe(true);
    expect(result.story?.nodes[0].metadata.legacy).toBe(7);
    expect(result.issues[0].severity).toBe("warning");
  });

  it("updates start and incoming references through repeated node renames", () => {
    const story = makeIdeStory(); story.nodes[1].choices = [{ text: "Back", destination: "Intro" }];
    let workspace = createWorkspace("file", story);
    workspace = edit(workspace, 0, { name: "Start" });
    workspace = edit(workspace, 0, { name: "Opening" });
    const result = evaluateDraft(workspace, story, ideMetadata);
    expect(result.story?.start).toBe("Opening");
    expect(result.story?.nodes[1].choices[0].destination).toBe("Opening");
    expect(canApplyDraft(result)).toBe(true);
  });

  it("previews node removal with incoming choices removed and supports restoring it", () => {
    const story = makeIdeStory(); const workspace = createWorkspace("file", story);
    workspace.documents[1].deleted = true;
    expect(evaluateDraft(workspace, story, ideMetadata).story?.nodes[0].choices).toEqual([]);
    workspace.documents[1].deleted = false;
    expect(evaluateDraft(workspace, story, ideMetadata).story).toEqual(story);
  });

  it("keeps incoming references attached while a typed rename temporarily collides", () => {
    const story = makeIdeStory(); story.nodes[1].choices = [{ text: "Back", destination: "Intro" }];
    const collision = edit(createWorkspace("file", story), 0, { name: "Outro" });
    const repaired = edit(collision, 0, { name: "Outro2" });
    const result = evaluateDraft(repaired, story, ideMetadata);
    expect(result.story?.nodes[1].choices[0].destination).toBe("Outro2");
    expect(canApplyDraft(result)).toBe(true);
  });

  it("does not invent a start node on viewing or exporting a story with no start", () => {
    const story = makeIdeStory(); story.start = null;
    expect(evaluateDraft(createWorkspace("file", story), story, ideMetadata).story).toEqual(story);
  });

  it("merges independent saved edits into the pending fix", () => {
    const original = makeIdeStory(); const saved = makeIdeStory();
    saved.nodes[0].content = ["The designer changed this."];
    saved.nodes[1].metadata.visited = false;
    const workspace = edit(createWorkspace("file", original), 0, { metadata: { reward: 25, visited: false } });
    const result = evaluateDraft(workspace, saved, ideMetadata);
    expect(result.conflicts).toEqual([]);
    expect(result.story?.nodes[0]).toMatchObject({ content: saved.nodes[0].content, metadata: { reward: 25 } });
    expect(result.story?.nodes[1].metadata.visited).toBe(false);
  });

  it("requires an explicit choice for overlapping fields, and invalidates stale resolutions", () => {
    const original = makeIdeStory(); const saved = makeIdeStory(); saved.nodes[0].metadata.reward = 50;
    const workspace = edit(createWorkspace("file", original), 0, { metadata: { reward: 25, visited: false } });
    const result = evaluateDraft(workspace, saved, ideMetadata);
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0]).toMatchObject({ path: ["metadata", "reward"], original: 100, saved: 50, draft: 25 });
    expect(canApplyDraft(result)).toBe(false);
    workspace.resolutions[result.conflicts[0].id] = "draft";
    expect(canApplyDraft(evaluateDraft(workspace, saved, ideMetadata))).toBe(true);
    saved.nodes[0].metadata.reward = 75;
    expect(evaluateDraft(workspace, saved, ideMetadata).conflicts).toHaveLength(1);
  });

  it("preserves newly saved nodes and their order when applying an unrelated fix", () => {
    const original = makeIdeStory(); const saved = makeIdeStory();
    saved.nodes.reverse();
    saved.nodes.push({ name: "External", content: [], choices: [], metadata: {} });
    const result = evaluateDraft(edit(createWorkspace("file", original), 0, { metadata: { reward: 25, visited: false } }), saved, ideMetadata);
    expect(result.story?.nodes.map((node) => node.name)).toEqual(["Outro", "Intro", "External"]);
  });

  it("does not discard distinct nodes in an existing duplicate-name story", () => {
    const story = makeIdeStory(); story.nodes[1].name = "Intro"; story.nodes[0].choices = [];
    const result = evaluateDraft(createWorkspace("file", story), story, ideMetadata);
    expect(result.story?.nodes.map((node) => node.content)).toEqual(story.nodes.map((node) => node.content));
  });

  it("restores links and the start if a deletion conflict is resolved by keeping the saved node", () => {
    const original = makeIdeStory(); original.nodes[1].choices.push({ text: "Back", destination: "Intro" });
    const saved = { ...original, nodes: original.nodes.map((node) => ({ ...node, content: node.name === "Intro" ? ["Changed externally"] : node.content })) };
    const workspace = createWorkspace("file", original); workspace.documents[0].deleted = true;
    const result = evaluateDraft(workspace, saved, ideMetadata);
    workspace.resolutions[result.conflicts[0].id] = "saved";
    const resolved = evaluateDraft(workspace, saved, ideMetadata);
    expect(resolved.story?.start).toBe("Intro");
    expect(resolved.story?.nodes.find((node) => node.name === "Outro")?.choices).toEqual(original.nodes[1].choices);
  });

  it("reviews an edited duplicate without redirecting ambiguous incoming links", () => {
    const story = makeIdeStory(); story.nodes[1].name = "Intro";
    story.nodes[0].choices = [{ text: "Another Intro", destination: "Intro" }];
    const edited = edit(createWorkspace("file", story), 0, { metadata: { reward: 25, visited: false } });
    expect(draftChanges(story, evaluateDraft(edited, story, ideMetadata).story!)).toHaveLength(1);
    const renamed = edit(createWorkspace("file", story), 0, { name: "Opening" });
    expect(evaluateDraft(renamed, story, ideMetadata).story?.nodes[0].choices[0].destination).toBe("Intro");
  });

  it("does not resurrect a removed new node when independent saved edits are recovered", () => {
    const story = makeIdeStory(); const saved = makeIdeStory(); saved.nodes[0].content = ["Updated line"];
    const workspace = edit(createWorkspace("file", story), 0, { metadata: { reward: 25, visited: false } });
    workspace.documents.push({ id: "new", originalName: null, deleted: true, text: serializeNode({ name: "Discarded", content: [], choices: [], metadata: {} }) });
    const result = evaluateDraft(workspace, saved, ideMetadata);
    const rebased = rebaseWorkspace(workspace, saved, result);
    expect(rebased.documents.find((document) => document.id === "new")?.deleted).toBe(true);
    expect(evaluateDraft(rebased, saved, ideMetadata).story?.nodes.map((node) => node.name)).toEqual(["Intro", "Outro"]);
  });
});

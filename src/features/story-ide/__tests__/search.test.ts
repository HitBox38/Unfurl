import { describe, expect, it } from "vitest";

import { createWorkspace, emptySearch } from "@/features/story-ide/draft";
import { previewReplacement, searchDocuments } from "@/features/story-ide/search";
import { jsonRangeAtPath } from "@/shared/lib/json-source";
import { makeIdeStory } from "@/test/fixtures/story-ide";

describe("story investigation", () => {
  it("targets a typed metadata value without changing dialogue or graph positions", () => {
    const story = makeIdeStory(); const workspace = createWorkspace("file", story);
    const search = { ...emptySearch, query: "100", scope: "metadata" as const, field: "reward", exact: true };
    const matches = searchDocuments(workspace.documents, search);
    expect(matches).toHaveLength(2);
    const preview = previewReplacement(workspace.documents, search, matches, "25");
    expect(preview.errors).toEqual([]);
    const nodes = preview.documents.map((document) => JSON.parse(document.text));
    expect(nodes.map((node) => node.metadata.reward)).toEqual([25, 25]);
    expect(nodes[0].content).toEqual(story.nodes[0].content);
    expect(nodes[0].position).toEqual(story.nodes[0].position);
  });

  it("rejects type-changing replacements for numbers and booleans", () => {
    const workspace = createWorkspace("file", makeIdeStory());
    for (const field of ["reward", "visited"]) {
      const search = { ...emptySearch, scope: "metadata" as const, field };
      const preview = previewReplacement(workspace.documents, search, searchDocuments(workspace.documents, search), '"text"');
      expect(preview.errors.length).toBeGreaterThan(0);
      expect(preview.documents).toEqual(workspace.documents);
    }
  });

  it("searches keys, choice text, destinations, and content, and provides exact source ranges", () => {
    const workspace = createWorkspace("file", makeIdeStory());
    const matches = searchDocuments(workspace.documents, { ...emptySearch, query: "reward" });
    expect(matches).toHaveLength(2);
    expect(matches[0]).toMatchObject({ key: true, path: ["metadata", "reward"] });
    const range = jsonRangeAtPath(workspace.documents[0].text, ["choices", 0, "destination"]);
    expect(workspace.documents[0].text.slice(range!.from, range!.to)).toBe('"Outro"');
    expect(searchDocuments(workspace.documents, { ...emptySearch, query: "outro", scope: "destination" })).toHaveLength(1);
    expect(searchDocuments(workspace.documents, { ...emptySearch, query: "coins", scope: "content" })).toHaveLength(1);
  });

  it("uses literal replacements and handles escaped text and punctuation", () => {
    const story = makeIdeStory(); story.nodes[0].content = ['A $value. A $value. "quoted"'];
    const workspace = createWorkspace("file", story);
    const search = { ...emptySearch, query: "$value.", scope: "content" as const };
    const preview = previewReplacement(workspace.documents, search, searchDocuments(workspace.documents, search), "$&");
    expect(JSON.parse(preview.documents[0].text).content[0]).toBe('A $& A $& "quoted"');
  });
});

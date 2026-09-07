import { describe, expect, it } from "vitest";

import { importFiles } from "@/features/file-import/hooks/use-import-files";
import { listEditableFiles } from "@/shared/lib/editable-files-storage";
import type { MetadataConfigTemplate, StoryData } from "@/shared/types";

const emptyConfig: MetadataConfigTemplate = { config: [] };

const goldConfig: MetadataConfigTemplate = {
  config: [{ name: "gold", sign: "$gold", type: "number", label: "Gold" }],
};

const tweeSource = `:: Intro\nHello\n[[Go->Forest]]\n\n:: Forest\nTrees\n`;

const storyJson: StoryData = {
  title: "From JSON",
  start: "A",
  nodes: [{ name: "A", content: ["text"], choices: [], metadata: {} }],
};

const makeFile = (name: string, body: string) => new File([body], name);

describe("importFiles", () => {
  it("creates one record per .twee and .json file in the target project", async () => {
    const result = await importFiles({
      files: [
        makeFile("quest.twee", tweeSource),
        makeFile("archive.json", JSON.stringify(storyJson)),
      ],
      projectId: "p1",
      metadataConfig: emptyConfig,
    });

    expect(result.failed).toEqual([]);
    expect(result.skipped).toEqual([]);
    expect(result.imported.map((file) => [file.name, file.fileType, file.projectId])).toEqual([
      ["quest", "twee", "p1"],
      ["archive", "json", "p1"],
    ]);
    expect(result.imported[0].content.nodes.map((node) => node.name)).toEqual([
      "Intro",
      "Forest",
    ]);
    expect(result.imported[1].content).toEqual(storyJson);
    expect(listEditableFiles()).toHaveLength(2);
  });

  it("groups every .md note into a single story named after the title", async () => {
    const result = await importFiles({
      files: [
        makeFile("Start.md", "Hello\n[[End]]"),
        makeFile("End.md", "Bye"),
      ],
      projectId: "p1",
      metadataConfig: emptyConfig,
      markdownTitle: "  Obsidian tale ",
    });

    expect(result.imported).toHaveLength(1);
    expect(result.imported[0]).toMatchObject({
      name: "Obsidian tale",
      fileType: "md",
      projectId: "p1",
    });
    expect(result.imported[0].content.nodes.map((node) => node.name)).toEqual([
      "Start",
      "End",
    ]);
  });

  it("refuses .md notes without a title", async () => {
    const result = await importFiles({
      files: [makeFile("Start.md", "Hello")],
      projectId: "p1",
      metadataConfig: emptyConfig,
    });

    expect(result.imported).toEqual([]);
    expect(result.failed).toEqual([
      { fileName: "Start.md", reason: expect.stringMatching(/title/i) },
    ]);
  });

  it("skips unsupported extensions", async () => {
    const result = await importFiles({
      files: [makeFile("notes.txt", "nope"), makeFile("image.PNG", "")],
      projectId: "p1",
      metadataConfig: emptyConfig,
    });

    expect(result.imported).toEqual([]);
    expect(result.skipped).toEqual(["notes.txt", "image.PNG"]);
  });

  it("reports invalid JSON and JSON that is not a story instead of throwing", async () => {
    const result = await importFiles({
      files: [
        makeFile("broken.json", "{not json"),
        makeFile("random.json", JSON.stringify({ hello: "world" })),
      ],
      projectId: "p1",
      metadataConfig: emptyConfig,
    });

    expect(result.imported).toEqual([]);
    expect(result.failed).toEqual([
      { fileName: "broken.json", reason: expect.stringMatching(/json/i) },
      { fileName: "random.json", reason: expect.stringMatching(/story/i) },
    ]);
  });

  it("backfills missing metadata from the project's config for JSON imports", async () => {
    const result = await importFiles({
      files: [makeFile("archive.json", JSON.stringify(storyJson))],
      projectId: "p1",
      metadataConfig: goldConfig,
    });

    expect(result.imported[0].content.nodes[0].metadata).toEqual({ gold: 0 });
  });

  it("parses metadata signs from Twee using the project's config", async () => {
    const result = await importFiles({
      files: [makeFile("quest.twee", `:: Intro\n$gold 25\nHello\n`)],
      projectId: "p1",
      metadataConfig: goldConfig,
    });

    expect(result.imported[0].content.nodes[0].metadata).toEqual({ gold: 25 });
    expect(result.imported[0].content.nodes[0].content).toEqual(["Hello"]);
  });
});

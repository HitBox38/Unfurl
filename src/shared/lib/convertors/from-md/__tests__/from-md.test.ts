import { describe, expect, it } from "vitest";

import { parseMarkdownEntries } from "@/shared/lib/convertors/from-md";

describe("parseMarkdownEntries", () => {
  const entries = [
    {
      name: "Start",
      source: "Welcome traveler.\n[[Next]]\n",
    },
    {
      name: "Next",
      source: "You move on.\n[[Start|Back home]]\n",
    },
  ];

  it("parses choices from [[link]] and [[target|label]] syntax", () => {
    const story = parseMarkdownEntries(entries, "Demo", { config: null });
    expect(story.nodes[0].choices).toEqual([
      { text: "Next", destination: "Next" },
    ]);
    expect(story.nodes[1].choices).toEqual([
      { text: "Back home", destination: "Start" },
    ]);
  });

  it("derives the start node as the one with no incoming references", () => {
    const story = parseMarkdownEntries(entries, "Demo", { config: null });
    expect(story.start).toBe("Next");
  });

  it("preserves the supplied title", () => {
    const story = parseMarkdownEntries(entries, "Adventure", { config: null });
    expect(story.title).toBe("Adventure");
  });

  it("treats non-choice non-sign lines as content", () => {
    const story = parseMarkdownEntries(entries, "Demo", { config: null });
    expect(story.nodes[0].content).toEqual(["Welcome traveler."]);
  });

  it("matches metadata signs with the configured types", () => {
    const story = parseMarkdownEntries(
      [
        {
          name: "Hero",
          source: "$hp 7\n$awake\nReady to begin.\n",
        },
      ],
      "Demo",
      {
        config: {
          config: [
            { name: "hp", sign: "$hp", type: "number" },
            { name: "awake", sign: "$awake", type: "boolean" },
          ],
        },
      },
    );
    const hero = story.nodes[0];
    expect(hero.metadata.hp).toBe(7);
    expect(hero.metadata.awake).toBe(true);
    expect(hero.content).toEqual(["Ready to begin."]);
  });
});

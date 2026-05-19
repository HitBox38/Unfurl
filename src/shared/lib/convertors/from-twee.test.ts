import { describe, expect, it } from "vitest";

import { parseTwee } from "@/shared/lib/convertors/from-twee";
import { sampleTwee } from "@/test/fixtures/twee";

describe("parseTwee", () => {
  it("extracts story title, start node, and node list", () => {
    const story = parseTwee(sampleTwee, { config: null });

    expect(story.title).toBe("My Demo Story");
    expect(story.start).toBe("Intro");
    expect(story.nodes.map((n) => n.name)).toEqual([
      "Intro",
      "Forest",
      "Cave",
    ]);
  });

  it("extracts choices with explicit destinations", () => {
    const story = parseTwee(sampleTwee, { config: null });
    const intro = story.nodes.find((n) => n.name === "Intro");
    expect(intro?.choices).toEqual([
      { text: "Continue", destination: "Forest" },
    ]);
  });

  it("supports multiple choices on a single line and defaults destination to text", () => {
    const story = parseTwee(sampleTwee, { config: null });
    const forest = story.nodes.find((n) => n.name === "Forest");
    expect(forest?.choices).toEqual([
      { text: "Go back", destination: "Intro" },
      { text: "Press on", destination: "Cave" },
    ]);
  });

  it("collects non-choice lines into the node content", () => {
    const story = parseTwee(sampleTwee, { config: null });
    const cave = story.nodes.find((n) => n.name === "Cave");
    expect(cave?.content).toEqual(["The cave is silent."]);
  });

  it("preserves Twee node position and size metadata", () => {
    const story = parseTwee(
      `:: Intro {"position":"25,50","size":"200,100"}
Hello
`,
      { config: null },
    );

    expect(story.nodes[0]).toMatchObject({
      position: { x: 25, y: 50 },
      size: { width: 200, height: 100 },
    });
  });

  it("applies metadata sign matching when a config is provided", () => {
    const source = `:: Hero
$hp 10
$alive
A passage.
[[Next->Forest]]
`;
    const story = parseTwee(source, {
      config: {
        config: [
          { name: "hp", sign: "$hp", type: "number" },
          { name: "alive", sign: "$alive", type: "boolean" },
        ],
      },
    });
    const hero = story.nodes[0];
    expect(hero.metadata.hp).toBe(10);
    expect(hero.metadata.alive).toBe(true);
    expect(hero.content).toEqual(["A passage."]);
  });
});

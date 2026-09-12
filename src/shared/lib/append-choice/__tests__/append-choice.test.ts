import { describe, expect, it } from "vitest";

import { appendChoice, createChoice } from "@/shared/lib/append-choice";
import type { StoryNode } from "@/shared/types";

const sourceNode: StoryNode = {
  name: "Intro",
  metadata: {},
  choices: [{ text: "Existing", destination: "Middle" }],
  content: [],
};

describe("appendChoice", () => {
  it("creates a blank choice for a destination", () => {
    expect(createChoice("Outro")).toEqual({
      text: "",
      destination: "Outro",
    });
  });

  it("appends a choice without mutating the original node", () => {
    const nextNode = appendChoice(sourceNode, createChoice("Outro", "Leave"));

    expect(nextNode.choices).toEqual([
      { text: "Existing", destination: "Middle" },
      { text: "Leave", destination: "Outro" },
    ]);
    expect(sourceNode.choices).toEqual([
      { text: "Existing", destination: "Middle" },
    ]);
  });
});

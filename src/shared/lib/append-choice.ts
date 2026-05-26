import type { Choice, StoryNode } from "@/shared/types";

export const createChoice = (destination: string, text = ""): Choice => ({
  text,
  destination,
});

export const appendChoice = (
  node: StoryNode,
  choice: Choice,
): StoryNode => ({
  ...node,
  choices: [...node.choices, choice],
});

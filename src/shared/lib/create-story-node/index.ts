import type { StoryNode } from "@/shared/types";

export { uniqueStoryNodeName } from "./helpers";

export const createStoryNode = (
  name: string,
  position?: { x: number; y: number },
): StoryNode => ({
  name,
  content: [],
  choices: [],
  metadata: {},
  ...(position ? { position } : {}),
});

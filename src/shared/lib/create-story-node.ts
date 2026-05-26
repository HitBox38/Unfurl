import type { StoryNode } from "@/shared/types";

export const uniqueStoryNodeName = (
  existingNames: readonly string[],
  base = "Node",
): string => {
  if (!existingNames.includes(base)) {
    return base;
  }

  let index = 2;
  while (existingNames.includes(`${base} ${index}`)) {
    index += 1;
  }

  return `${base} ${index}`;
};

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

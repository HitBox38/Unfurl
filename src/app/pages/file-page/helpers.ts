import type { StoryData } from "@/shared/types";

export const isBlankStory = (content: StoryData) => {
  const [startNode] = content.nodes;

  return (
    content.nodes.length === 1 &&
    content.start === startNode?.name &&
    startNode.content.every((line) => line.trim() === "") &&
    startNode.choices.length === 0
  );
};

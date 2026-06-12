import type { StoryNode } from "@/shared/types";

export interface StoryNodeForm extends Omit<StoryNode, "content"> {
  content: string;
}

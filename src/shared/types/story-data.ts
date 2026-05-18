import type { StoryNode } from "@/shared/types/node";

export interface StoryData {
  title: string | null;
  start: string | null;
  nodes: StoryNode[];
}

import { StoryNode } from "./Node";

export interface StoryData {
  title: string | null;
  start: string | null;
  nodes: StoryNode[];
}

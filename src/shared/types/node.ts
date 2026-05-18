import type { Choice } from "@/shared/types/choice";

export interface StoryNode {
  name: string;
  metadata: {
    [key: string]: number | boolean;
  };
  choices: Choice[];
  content: string[];
}

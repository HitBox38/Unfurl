import type { Choice } from "@/shared/types/choice";

export interface StoryNode {
  name: string;
  position?: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
  metadata: {
    [key: string]: number | boolean;
  };
  choices: Choice[];
  content: string[];
}

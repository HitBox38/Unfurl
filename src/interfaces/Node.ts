import { Choice } from "./Choice";

export interface StoryNode {
  name: string;
  metadata: {
    [key: string]: number | boolean;
  };
  choices: Choice[];
  content: string[];
}

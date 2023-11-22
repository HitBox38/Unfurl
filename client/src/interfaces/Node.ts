import { Choice } from "./Choice";

export interface StoryNode {
  name: string;
  metadata: {
    // affectionToAdd: number;
    // affectionRequired: number;
    // giveBlessing: boolean;
    // giveHead: boolean;
    [key: string]: number | boolean;
  };
  choices: Choice[];
  content: string[];
}

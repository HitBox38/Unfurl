import { Choice } from "./Choice";

export interface StoryNode {
  name: string;
  affectionToAdd: number;
  affectionRequired: number;
  giveBlessing: boolean;
  giveHead: boolean;
  choices: Choice[];
  content: string[];
}

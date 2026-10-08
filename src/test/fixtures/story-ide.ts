import type { MetadataConfigTemplate, StoryData } from "@/shared/types";

export const ideMetadata: MetadataConfigTemplate = { config: [
  { name: "reward", type: "number", sign: "#reward:", label: "Reward" },
  { name: "visited", type: "boolean", sign: "#visited", label: "Visited" },
] };

export const makeIdeStory = (): StoryData => ({
  title: "Quest", start: "Intro", nodes: [
    { name: "Intro", content: ["Earn 100 coins."], choices: [{ text: "Continue", destination: "Outro" }], metadata: { reward: 100, visited: false }, position: { x: 100, y: 0 } },
    { name: "Outro", content: ["Goodbye."], choices: [], metadata: { reward: 100, visited: true }, position: { x: 100, y: 200 } },
  ],
});

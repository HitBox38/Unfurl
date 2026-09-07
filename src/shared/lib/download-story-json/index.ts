import { downloadJsonFile } from "@/shared/lib/download-json-file";
import type { StoryData } from "@/shared/types";

export const downloadStoryAsJson = (name: string, content: StoryData) =>
  downloadJsonFile(`${name || "story"}.json`, content);

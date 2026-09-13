import { downloadJsonFile } from "@/shared/lib/download-json-file";
import { nodeCountBucket, trackEvent } from "@/shared/lib/analytics";
import type { StoryData } from "@/shared/types";

export const downloadStoryAsJson = (name: string, content: StoryData) => {
  const properties = {
    format: "json" as const,
    node_count_bucket: nodeCountBucket(content.nodes.length),
  };
  try {
    downloadJsonFile(`${name || "story"}.json`, content);
    trackEvent("export_succeeded", properties);
  } catch (error) {
    trackEvent("export_failed", { ...properties, error_class: "download" });
    throw error;
  }
};

import type { MetadataConfigTemplate } from "@/shared/types";

/** Builds a node's initial metadata: every configured field at its zero value. */
export const seedMetadataDefaults = (
  config: MetadataConfigTemplate | null,
): Record<string, number | boolean> => {
  const metadata: Record<string, number | boolean> = {};
  if (!config) {
    return metadata;
  }
  for (const item of config.config) {
    if (item.type === "number") {
      metadata[item.name] = 0;
    } else if (item.type === "boolean") {
      metadata[item.name] = false;
    }
  }
  return metadata;
};

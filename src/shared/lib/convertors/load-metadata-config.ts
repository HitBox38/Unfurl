import type { MetadataConfigTemplate } from "@/shared/types";

export const loadMetadataConfigFromStorage = (
  storage: Storage = localStorage,
): MetadataConfigTemplate | null => {
  const raw = storage.getItem("metadataConfig");
  if (raw === null) {
    return null;
  }
  try {
    return JSON.parse(raw) as MetadataConfigTemplate;
  } catch {
    return null;
  }
};

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

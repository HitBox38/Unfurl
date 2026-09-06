import type { MetadataConfigTemplate } from "@/shared/types";

export interface ProjectDraft {
  name: string;
  metadataConfig?: MetadataConfigTemplate;
}

export interface ProjectStorageOptions {
  storage?: Storage;
  now?: () => number;
  createId?: () => string;
}

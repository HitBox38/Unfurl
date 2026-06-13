import type { MetadataConfigTemplate } from "@/shared/types";

export interface FromMdOptions {
  config?: MetadataConfigTemplate | null;
}

export interface MarkdownEntry {
  name: string;
  source: string;
}

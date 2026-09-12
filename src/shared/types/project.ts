import type { MetadataConfigTemplate } from "@/shared/types/metadata-config-template";

/**
 * Where a project's files come from. Only `local` (localStorage-only) exists
 * today; disk folders and GitHub repositories are planned as additional
 * discriminants, which is why this is an object rather than a bare string.
 */
export type ProjectSource = { kind: "local" };

export interface ProjectRecord {
  id: string;
  name: string;
  source: ProjectSource;
  metadataConfig: MetadataConfigTemplate;
  createdAt: number;
  updatedAt: number;
}

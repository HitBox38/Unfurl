import type { EditableFileRecord } from "@/shared/lib/editable-files-storage";
import type { MetadataConfigTemplate } from "@/shared/types";

export interface ImportFilesInput {
  files: File[];
  projectId: string;
  metadataConfig: MetadataConfigTemplate;
  /** Required whenever `files` contains Markdown notes; they become one story. */
  markdownTitle?: string;
}

export interface ImportFailure {
  fileName: string;
  reason: string;
}

export interface ImportFilesResult {
  imported: EditableFileRecord[];
  failed: ImportFailure[];
  /** Names of files with an unsupported extension. */
  skipped: string[];
}

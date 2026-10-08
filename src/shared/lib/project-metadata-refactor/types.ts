import type { EditableFileRecord } from "@/shared/lib/editable-files-storage";
import type { MetadataConfigTemplate, MetadataField } from "@/shared/types";

export interface MetadataEdit {
  id: string;
  originalName: string | null;
  field: MetadataField | null;
  defaultValue: number | boolean;
  conversion: "none" | "binary";
}

export interface MetadataChange {
  fileId: string;
  fileName: string;
  nodeName: string;
  field: string;
  before: number | boolean | undefined;
  after: number | boolean | undefined;
}

export interface MetadataRefactorPlan {
  projectId: string;
  baseConfig: MetadataConfigTemplate;
  nextConfig: MetadataConfigTemplate;
  baseFiles: EditableFileRecord[];
  nextFiles: EditableFileRecord[];
  changes: MetadataChange[];
  errors: string[];
  undoAvailable: boolean;
}

export interface MetadataUndo {
  expiresAt: number;
  projectId: string;
  beforeConfig: MetadataConfigTemplate;
  afterConfig: MetadataConfigTemplate;
  beforeFiles: EditableFileRecord[];
  afterFiles: EditableFileRecord[];
}

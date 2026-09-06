import type { StoryData, SupportedFileType } from "@/shared/types";

export interface EditableFileRecord {
  id: string;
  projectId: string;
  name: string;
  fileType: SupportedFileType;
  content: StoryData;
  updatedAt: number;
}

export interface EditableFileDraft {
  id?: string;
  projectId: string;
  name: string;
  fileType: SupportedFileType;
  content: StoryData;
}

export interface StorageOptions {
  storage?: Storage;
  now?: () => number;
  createId?: () => string;
}

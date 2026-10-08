import type { StoryPath } from "@/shared/lib/story-validation";
import type { StoryData, StoryNode } from "@/shared/types";

export interface NodeDocument {
  id: string;
  originalName: string | null;
  text: string;
  lastName?: string;
  deleted?: boolean;
}

export type SearchScope =
  | "all"
  | "name"
  | "content"
  | "choices"
  | "destination"
  | "metadata";
export interface StorySearch {
  query: string;
  scope: SearchScope;
  field: string;
  exact: boolean;
  caseSensitive: boolean;
}

export interface IdeWorkspace {
  version: 1;
  fileId: string;
  base: StoryData;
  documents: NodeDocument[];
  tabs: string[];
  activeId: string | null;
  search: StorySearch;
  lastValid: StoryData;
  mode: "graph" | "ide";
  resolutions: Record<string, "saved" | "draft">;
}

export interface IdeIssue {
  documentId: string | null;
  path: StoryPath;
  severity: "error" | "warning";
  message: string;
}

export interface MergeConflict {
  id: string;
  documentId: string | null;
  nodeName: string;
  path: StoryPath;
  original: unknown;
  saved: unknown;
  draft: unknown;
}

export interface DraftResult {
  story: StoryData | null;
  issues: IdeIssue[];
  conflicts: MergeConflict[];
  nodesByDocument: Map<string, StoryNode>;
  mergedByDocument: Map<string, StoryNode>;
  sourceByDocument: Map<string, StoryNode>;
  savedByDocument: Map<string, StoryNode>;
}

export interface SearchMatch {
  documentId: string;
  nodeName: string;
  path: StoryPath;
  value: string | number | boolean;
  from: number;
  to: number;
  key?: boolean;
}

export interface EditorLocation {
  documentId: string;
  path: StoryPath;
  key?: boolean;
  token: number;
}

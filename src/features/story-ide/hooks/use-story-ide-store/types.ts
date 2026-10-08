import type { StoryData } from "@/shared/types";
import type { IdeWorkspace, StorySearch } from "@/features/story-ide/types";

export interface StoryIdeState {
  workspaces: Record<string, IdeWorkspace>;
  storageError: string | null;
  initialize: (fileId: string, saved: StoryData) => void;
  update: (
    fileId: string,
    edit: (workspace: IdeWorkspace) => IdeWorkspace,
    preview?: boolean,
  ) => void;
  editDocument: (fileId: string, documentId: string, text: string) => void;
  selectDocument: (fileId: string, documentId: string) => void;
  closeTab: (fileId: string, documentId: string) => void;
  setSearch: (fileId: string, search: Partial<StorySearch>) => void;
  setMode: (fileId: string, mode: "graph" | "ide") => void;
  addNode: (fileId: string) => void;
  deleteNode: (fileId: string, documentId: string) => void;
  resolve: (
    fileId: string,
    conflictId: string,
    resolution: "saved" | "draft",
  ) => void;
  reset: (fileId: string, story: StoryData) => void;
  refreshPreview: (fileId: string) => void;
}

export interface WorkspaceView {
  version: 1;
  mode: IdeWorkspace["mode"];
  search: StorySearch;
  tabs: number[];
  activeIndex: number;
}

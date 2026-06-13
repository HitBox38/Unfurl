import type { StoryData, StoryNode } from "@/shared/types";

export interface FileHistorySnapshot {
  name: string;
  content: StoryData;
}

export interface JsonDataState {
  name: string;
  activeFileId: string | null;
  content: StoryData;
  isLoading: boolean;
  past: FileHistorySnapshot[];
  future: FileHistorySnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  setJson: (
    newJson: StoryData,
    newName: string,
    activeFileId?: string | null,
  ) => void;
  setName: (name: string) => void;
  setNode: (newNode: StoryNode, previousName?: string) => void;
  addNode: (node: StoryNode) => void;
  removeNode: (nodeName: string) => void;
  undo: () => void;
  redo: () => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

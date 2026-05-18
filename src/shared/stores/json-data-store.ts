import { create } from "zustand";

import { updateEditableFileContent } from "@/shared/lib/editable-files-storage";
import type { StoryData, StoryNode } from "@/shared/types";

export interface JsonDataState {
  name: string;
  activeFileId: string | null;
  content: StoryData;
  isLoading: boolean;
  setJson: (
    newJson: StoryData,
    newName: string,
    activeFileId?: string | null,
  ) => void;
  setNode: (newNode: StoryNode) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

const emptyContent: StoryData = { nodes: [], start: null, title: null };

export const useJsonDataStore = create<JsonDataState>((set) => ({
  name: "",
  activeFileId: null,
  content: emptyContent,
  isLoading: false,
  setJson: (newJson, newName, activeFileId = null) =>
    set({
      name: newName,
      activeFileId,
      content: newJson,
      isLoading: false,
    }),
  setNode: (newNode) =>
    set((state) => ({
      content: persistActiveFileContent(state.activeFileId, {
        ...state.content,
        nodes: state.content.nodes.map((node) =>
          node.name === newNode.name ? newNode : node,
        ),
      }),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({
      name: "",
      activeFileId: null,
      content: emptyContent,
      isLoading: false,
    }),
}));

const persistActiveFileContent = (
  activeFileId: string | null,
  content: StoryData,
) => {
  if (activeFileId) {
    updateEditableFileContent(activeFileId, content);
  }
  return content;
};

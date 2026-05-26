import { create } from "zustand";

import {
  updateEditableFileContent,
  updateEditableFileName,
} from "@/shared/lib/editable-files-storage";
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
  setName: (name: string) => void;
  setNode: (newNode: StoryNode, previousName?: string) => void;
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
  setName: (name) =>
    set((state) => {
      persistActiveFileName(state.activeFileId, name);
      return { name };
    }),
  setNode: (newNode, previousName = newNode.name) =>
    set((state) => ({
      content: persistActiveFileContent(state.activeFileId, {
        ...state.content,
        start:
          state.content.start === previousName ? newNode.name : state.content.start,
        nodes: state.content.nodes.map((node) => {
          const nextNode = node.name === previousName ? newNode : node;
          return {
            ...nextNode,
            choices: nextNode.choices.map((choice) =>
              choice.destination === previousName
                ? { ...choice, destination: newNode.name }
                : choice,
            ),
          };
        }),
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

const persistActiveFileName = (activeFileId: string | null, name: string) => {
  if (activeFileId) {
    updateEditableFileName(activeFileId, name);
  }
};

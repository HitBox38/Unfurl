import { create } from "zustand";

import type { StoryData, StoryNode } from "@/shared/types";

export interface JsonDataState {
  name: string;
  content: StoryData;
  isLoading: boolean;
  setJson: (newJson: StoryData, newName: string) => void;
  setNode: (newNode: StoryNode) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

const emptyContent: StoryData = { nodes: [], start: null, title: null };

export const useJsonDataStore = create<JsonDataState>((set) => ({
  name: "",
  content: emptyContent,
  isLoading: false,
  setJson: (newJson, newName) =>
    set({ name: newName, content: newJson, isLoading: false }),
  setNode: (newNode) =>
    set((state) => ({
      content: {
        ...state.content,
        nodes: state.content.nodes.map((node) =>
          node.name === newNode.name ? newNode : node,
        ),
      },
    })),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ name: "", content: emptyContent, isLoading: false }),
}));

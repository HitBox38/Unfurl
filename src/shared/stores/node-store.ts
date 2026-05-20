import { create } from "zustand";

import type { StoryNode } from "@/shared/types";

export interface NodeState {
  node: StoryNode | null;
  previewNodeName: string | null;
  setNode: (newNode: StoryNode | null) => void;
  setPreviewNodeName: (nodeName: string | null) => void;
}

export const useNodeStore = create<NodeState>((set) => ({
  node: null,
  previewNodeName: null,
  setNode: (newNode) => set({ node: newNode }),
  setPreviewNodeName: (nodeName) => set({ previewNodeName: nodeName }),
}));

import { create } from "zustand";

import type { StoryNode } from "@/shared/types";

interface GraphPreview {
  nodeName: string;
  edgeId?: string;
}

export interface NodeState {
  node: StoryNode | null;
  previewNodeName: string | null;
  previewEdgeId: string | null;
  setNode: (newNode: StoryNode | null) => void;
  setGraphPreview: (preview: GraphPreview | null) => void;
  setPreviewNodeName: (nodeName: string | null) => void;
}

export const useNodeStore = create<NodeState>((set) => ({
  node: null,
  previewNodeName: null,
  previewEdgeId: null,
  setNode: (newNode) => set({ node: newNode }),
  setGraphPreview: (preview) =>
    set({
      previewNodeName: preview?.nodeName ?? null,
      previewEdgeId: preview?.edgeId ?? null,
    }),
  setPreviewNodeName: (nodeName) =>
    set({ previewNodeName: nodeName, previewEdgeId: null }),
}));

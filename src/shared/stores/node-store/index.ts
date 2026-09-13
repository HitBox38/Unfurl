import { create } from "zustand";

import type { NodeState } from "./types";

export type { NodeState } from "./types";

export const useNodeStore = create<NodeState>((set) => ({
  node: null,
  isNew: false,
  startDraft: (node) => set({ node, isNew: true }),
  previewNodeName: null,
  previewEdgeId: null,
  setNode: (newNode) => set({ node: newNode, isNew: false }),
  setGraphPreview: (preview) =>
    set({
      previewNodeName: preview?.nodeName ?? null,
      previewEdgeId: preview?.edgeId ?? null,
    }),
  setPreviewNodeName: (nodeName) =>
    set({ previewNodeName: nodeName, previewEdgeId: null }),
}));

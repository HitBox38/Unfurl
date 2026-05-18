import { create } from "zustand";

import type { StoryNode } from "@/shared/types";

export interface NodeState {
  node: StoryNode | null;
  setNode: (newNode: StoryNode | null) => void;
}

export const useNodeStore = create<NodeState>((set) => ({
  node: null,
  setNode: (newNode) => set({ node: newNode }),
}));

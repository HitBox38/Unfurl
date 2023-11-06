import { create } from "zustand";
import { StoryNode } from "../interfaces/Node";

interface NodeStore {
  node: StoryNode | null;
  setNode: (newNode: StoryNode) => void;
}

export const UseNodeStore = create<NodeStore>((set) => ({
  node: null,
  setNode: (newNode) => set({ node: newNode }),
}));

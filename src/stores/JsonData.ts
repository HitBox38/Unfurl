import { create } from "zustand";
import { StoryData } from "../interfaces/StoryData";
import { StoryNode } from "../interfaces/Node";

interface JsonData {
  name: string;
  content: StoryData;
  isLoading: boolean;
  setJson: (newJson: StoryData, newName: string) => void;
  setNode: (newNode: StoryNode, oldJson: JsonData) => void;
}

export const UseJsonDataStore = create<JsonData>((set) => ({
  name: "",
  content: { nodes: [], start: null, title: null },
  isLoading: false,
  setJson: (newJson, newName) => set({ name: newName, content: newJson }),
  setNode: (newNode, oldJson) => {
    oldJson.content.nodes = oldJson.content.nodes.map((node) => {
      if (newNode.name === node.name) {
        console.log("found change", newNode);
        return newNode;
      } else {
        return node;
      }
    });

    set({ ...oldJson });
  },
}));

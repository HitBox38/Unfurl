import { create } from "zustand";
import { StoryData } from "../interfaces/StoryData";

interface JsonData {
  name: string;
  content: StoryData;
  setJson: (newJson: StoryData, newName: string) => void;
}

export const UseJsonDataStore = create<JsonData>((set) => ({
  name: "",
  content: { nodes: [], start: null, title: null },
  setJson: (newJson: StoryData, newName: string) => set({ name: newName, content: newJson }),
}));

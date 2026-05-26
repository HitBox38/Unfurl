import { create } from "zustand";

import {
  updateEditableFileContent,
  updateEditableFileName,
} from "@/shared/lib/editable-files-storage";
import type { StoryData, StoryNode } from "@/shared/types";

export interface FileHistorySnapshot {
  name: string;
  content: StoryData;
}

export interface JsonDataState {
  name: string;
  activeFileId: string | null;
  content: StoryData;
  isLoading: boolean;
  past: FileHistorySnapshot[];
  future: FileHistorySnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  setJson: (
    newJson: StoryData,
    newName: string,
    activeFileId?: string | null,
  ) => void;
  setName: (name: string) => void;
  setNode: (newNode: StoryNode, previousName?: string) => void;
  addNode: (node: StoryNode) => void;
  removeNode: (nodeName: string) => void;
  undo: () => void;
  redo: () => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

const emptyContent: StoryData = { nodes: [], start: null, title: null };
const maxHistoryDepth = 50;

export const useJsonDataStore = create<JsonDataState>((set) => ({
  name: "",
  activeFileId: null,
  content: emptyContent,
  isLoading: false,
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,
  setJson: (newJson, newName, activeFileId = null) =>
    set({
      name: newName,
      activeFileId,
      content: newJson,
      isLoading: false,
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    }),
  setName: (name) =>
    set((state) => {
      if (state.name === name) return {};
      persistActiveFileName(state.activeFileId, name);
      const past = pushHistorySnapshot(state);
      return {
        name,
        past,
        future: [],
        canUndo: true,
        canRedo: false,
      };
    }),
  setNode: (newNode, previousName = newNode.name) =>
    set((state) => {
      const content = {
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
      };

      if (snapshotsAreEqual({ name: state.name, content }, state)) {
        return {};
      }

      persistActiveFileContent(state.activeFileId, content);
      const past = pushHistorySnapshot(state);
      return {
        content,
        past,
        future: [],
        canUndo: true,
        canRedo: false,
      };
    }),
  addNode: (node) =>
    set((state) => {
      if (state.content.nodes.some((existing) => existing.name === node.name)) {
        return {};
      }

      const content: StoryData = {
        ...state.content,
        start: state.content.start ?? node.name,
        nodes: [...state.content.nodes, node],
      };

      if (snapshotsAreEqual({ name: state.name, content }, state)) {
        return {};
      }

      persistActiveFileContent(state.activeFileId, content);
      const past = pushHistorySnapshot(state);
      return {
        content,
        past,
        future: [],
        canUndo: true,
        canRedo: false,
      };
    }),
  removeNode: (nodeName) =>
    set((state) => {
      if (!state.content.nodes.some((node) => node.name === nodeName)) {
        return {};
      }

      const remainingNodes = state.content.nodes
        .filter((node) => node.name !== nodeName)
        .map((node) => ({
          ...node,
          choices: node.choices.filter(
            (choice) => choice.destination !== nodeName,
          ),
        }));

      const content: StoryData = {
        ...state.content,
        start:
          state.content.start === nodeName
            ? (remainingNodes[0]?.name ?? null)
            : state.content.start,
        nodes: remainingNodes,
      };

      if (snapshotsAreEqual({ name: state.name, content }, state)) {
        return {};
      }

      persistActiveFileContent(state.activeFileId, content);
      const past = pushHistorySnapshot(state);
      return {
        content,
        past,
        future: [],
        canUndo: true,
        canRedo: false,
      };
    }),
  undo: () =>
    set((state) => {
      const previous = state.past.at(-1);
      if (!previous) return {};

      const past = state.past.slice(0, -1);
      const future = [cloneSnapshot(state), ...state.future];
      persistActiveFileSnapshot(state.activeFileId, previous);

      return {
        ...previous,
        past,
        future,
        canUndo: past.length > 0,
        canRedo: true,
      };
    }),
  redo: () =>
    set((state) => {
      const next = state.future[0];
      if (!next) return {};

      const past = pushHistorySnapshot(state);
      const future = state.future.slice(1);
      persistActiveFileSnapshot(state.activeFileId, next);

      return {
        ...next,
        past,
        future,
        canUndo: true,
        canRedo: future.length > 0,
      };
    }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({
      name: "",
      activeFileId: null,
      content: emptyContent,
      isLoading: false,
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    }),
}));

const cloneValue = <T>(value: T): T =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);

const cloneSnapshot = ({
  name,
  content,
}: Pick<JsonDataState, "name" | "content">): FileHistorySnapshot => ({
  name,
  content: cloneValue(content),
});

const pushHistorySnapshot = (state: JsonDataState) =>
  [...state.past, cloneSnapshot(state)].slice(-maxHistoryDepth);

const snapshotsAreEqual = (
  next: FileHistorySnapshot,
  current: Pick<JsonDataState, "name" | "content">,
) =>
  next.name === current.name &&
  JSON.stringify(next.content) === JSON.stringify(current.content);

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

const persistActiveFileSnapshot = (
  activeFileId: string | null,
  snapshot: FileHistorySnapshot,
) => {
  if (!activeFileId) return;
  updateEditableFileContent(activeFileId, snapshot.content);
  updateEditableFileName(activeFileId, snapshot.name);
};

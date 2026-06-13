import { create } from "zustand";

import type { StoryData } from "@/shared/types";

import { emptyContent } from "./constants";
import {
  cloneSnapshot,
  persistActiveFileContent,
  persistActiveFileName,
  persistActiveFileSnapshot,
  pushHistorySnapshot,
  snapshotsAreEqual,
} from "./helpers";
import type { JsonDataState } from "./types";

export type { FileHistorySnapshot, JsonDataState } from "./types";

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

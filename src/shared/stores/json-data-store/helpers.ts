import {
  updateEditableFileContent,
  updateEditableFileName,
} from "@/shared/lib/editable-files-storage";

import type { FileHistorySnapshot, JsonDataState } from "./types";
import { maxHistoryDepth } from "./constants";

const cloneValue = <T>(value: T): T =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);

export const cloneSnapshot = ({
  name,
  content,
}: Pick<JsonDataState, "name" | "content">): FileHistorySnapshot => ({
  name,
  content: cloneValue(content),
});

export const pushHistorySnapshot = (state: JsonDataState) =>
  [...state.past, cloneSnapshot(state)].slice(-maxHistoryDepth);

export const snapshotsAreEqual = (
  next: FileHistorySnapshot,
  current: Pick<JsonDataState, "name" | "content">,
) =>
  next.name === current.name &&
  JSON.stringify(next.content) === JSON.stringify(current.content);

export const persistActiveFileContent = (
  activeFileId: string | null,
  content: JsonDataState["content"],
) => {
  if (activeFileId) {
    updateEditableFileContent(activeFileId, content);
  }
  return content;
};

export const persistActiveFileName = (
  activeFileId: string | null,
  name: string,
) => {
  if (activeFileId) {
    updateEditableFileName(activeFileId, name);
  }
};

export const persistActiveFileSnapshot = (
  activeFileId: string | null,
  snapshot: FileHistorySnapshot,
) => {
  if (!activeFileId) return;
  updateEditableFileContent(activeFileId, snapshot.content);
  updateEditableFileName(activeFileId, snapshot.name);
};

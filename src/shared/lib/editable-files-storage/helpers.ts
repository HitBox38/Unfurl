import { STORAGE_EVENT } from "@/shared/hooks";

import { EDITABLE_FILES_STORAGE_KEY } from "./constants";
import type { EditableFileRecord } from "./types";

const defaultNow = () => Date.now();

export const createEditableFileId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const getStorage = (storage?: Storage) => storage ?? localStorage;

export const readFiles = (storage: Storage): EditableFileRecord[] => {
  const raw = storage.getItem(EDITABLE_FILES_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as EditableFileRecord[]) : [];
  } catch {
    storage.removeItem(EDITABLE_FILES_STORAGE_KEY);
    return [];
  }
};

export const notifyStorageChange = (files: EditableFileRecord[]) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(STORAGE_EVENT, {
      detail: { key: EDITABLE_FILES_STORAGE_KEY, newValue: files },
    }),
  );
};

export const writeFiles = (storage: Storage, files: EditableFileRecord[]) => {
  storage.setItem(EDITABLE_FILES_STORAGE_KEY, JSON.stringify(files));
  notifyStorageChange(files);
};

export const sortNewestFirst = (files: EditableFileRecord[]) =>
  [...files].sort((a, b) => b.updatedAt - a.updatedAt);

export const defaultTimestamp = defaultNow;

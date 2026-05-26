import { STORAGE_EVENT } from "@/shared/hooks";
import type { StoryData, SupportedFileType } from "@/shared/types";

export interface EditableFileRecord {
  id: string;
  name: string;
  fileType: SupportedFileType;
  content: StoryData;
  updatedAt: number;
}

export interface EditableFileDraft {
  id?: string;
  name: string;
  fileType: SupportedFileType;
  content: StoryData;
}

interface StorageOptions {
  storage?: Storage;
  now?: () => number;
  createId?: () => string;
}

export const EDITABLE_FILES_STORAGE_KEY = "editableFiles";

const defaultNow = () => Date.now();

const createEditableFileId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getStorage = (storage?: Storage) => storage ?? localStorage;

const readFiles = (storage: Storage): EditableFileRecord[] => {
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

const notifyStorageChange = (files: EditableFileRecord[]) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(STORAGE_EVENT, {
      detail: { key: EDITABLE_FILES_STORAGE_KEY, newValue: files },
    }),
  );
};

const writeFiles = (storage: Storage, files: EditableFileRecord[]) => {
  storage.setItem(EDITABLE_FILES_STORAGE_KEY, JSON.stringify(files));
  notifyStorageChange(files);
};

const sortNewestFirst = (files: EditableFileRecord[]) =>
  [...files].sort((a, b) => b.updatedAt - a.updatedAt);

export const listEditableFiles = (
  options: Pick<StorageOptions, "storage"> = {},
): EditableFileRecord[] =>
  sortNewestFirst(readFiles(getStorage(options.storage)));

export const getEditableFile = (
  id: string,
  options: Pick<StorageOptions, "storage"> = {},
): EditableFileRecord | null =>
  readFiles(getStorage(options.storage)).find((file) => file.id === id) ?? null;

export const searchEditableFiles = (
  query: string,
  options: Pick<StorageOptions, "storage"> = {},
): EditableFileRecord[] => {
  const normalizedQuery = query.trim().toLowerCase();
  const files = listEditableFiles(options);
  if (!normalizedQuery) return files;
  return files.filter((file) => {
    const searchable = [file.name, file.content.title, file.fileType]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return searchable.includes(normalizedQuery);
  });
};

export const saveEditableFile = (
  draft: EditableFileDraft,
  options: StorageOptions = {},
): EditableFileRecord => {
  const storage = getStorage(options.storage);
  const files = readFiles(storage);
  const record: EditableFileRecord = {
    id: draft.id ?? options.createId?.() ?? createEditableFileId(),
    name: draft.name,
    fileType: draft.fileType,
    content: draft.content,
    updatedAt: options.now?.() ?? defaultNow(),
  };
  writeFiles(
    storage,
    sortNewestFirst([
      record,
      ...files.filter((file) => file.id !== record.id),
    ]),
  );
  return record;
};

export const updateEditableFileContent = (
  id: string,
  content: StoryData,
  options: Omit<StorageOptions, "createId"> = {},
) => {
  const storage = getStorage(options.storage);
  const files = readFiles(storage);
  const updatedAt = options.now?.() ?? defaultNow();
  writeFiles(
    storage,
    sortNewestFirst(
      files.map((file) =>
        file.id === id ? { ...file, content, updatedAt } : file,
      ),
    ),
  );
};

export const updateEditableFileName = (
  id: string,
  name: string,
  options: Omit<StorageOptions, "createId"> = {},
) => {
  const storage = getStorage(options.storage);
  const files = readFiles(storage);
  const updatedAt = options.now?.() ?? defaultNow();
  writeFiles(
    storage,
    sortNewestFirst(
      files.map((file) =>
        file.id === id ? { ...file, name, updatedAt } : file,
      ),
    ),
  );
};

import type { StoryData } from "@/shared/types";

import {
  createEditableFileId,
  defaultTimestamp,
  getStorage,
  readFiles,
  sortNewestFirst,
  writeFiles,
} from "./helpers";
import type { EditableFileDraft, EditableFileRecord, StorageOptions } from "./types";

export { EDITABLE_FILES_STORAGE_KEY } from "./constants";
export type {
  EditableFileDraft,
  EditableFileRecord,
  StorageOptions,
} from "./types";

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
    updatedAt: options.now?.() ?? defaultTimestamp(),
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
  const updatedAt = options.now?.() ?? defaultTimestamp();
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
  const updatedAt = options.now?.() ?? defaultTimestamp();
  writeFiles(
    storage,
    sortNewestFirst(
      files.map((file) =>
        file.id === id ? { ...file, name, updatedAt } : file,
      ),
    ),
  );
};

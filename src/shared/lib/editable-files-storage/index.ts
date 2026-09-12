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

export const listEditableFilesByProject = (
  projectId: string,
  options: Pick<StorageOptions, "storage"> = {},
): EditableFileRecord[] =>
  listEditableFiles(options).filter((file) => file.projectId === projectId);

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
    projectId: draft.projectId,
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

export const moveEditableFile = (
  id: string,
  projectId: string,
  options: Omit<StorageOptions, "createId"> = {},
) => {
  const storage = getStorage(options.storage);
  const files = readFiles(storage);
  const updatedAt = options.now?.() ?? defaultTimestamp();
  writeFiles(
    storage,
    sortNewestFirst(
      files.map((file) =>
        file.id === id ? { ...file, projectId, updatedAt } : file,
      ),
    ),
  );
};

export const deleteEditableFile = (
  id: string,
  options: Pick<StorageOptions, "storage"> = {},
) => {
  const storage = getStorage(options.storage);
  writeFiles(
    storage,
    readFiles(storage).filter((file) => file.id !== id),
  );
};

export const deleteEditableFilesByProject = (
  projectId: string,
  options: Pick<StorageOptions, "storage"> = {},
) => {
  const storage = getStorage(options.storage);
  writeFiles(
    storage,
    readFiles(storage).filter((file) => file.projectId !== projectId),
  );
};

/**
 * Points every file whose project is missing or unknown at `fallbackProjectId`.
 * Used by the storage migration so records written before projects existed
 * (or whose project vanished) never become unreachable. Returns how many files
 * were reassigned; storage is left untouched when nothing needs repair.
 */
export const repairFileProjectIds = (
  validProjectIds: readonly string[],
  fallbackProjectId: string,
  options: Pick<StorageOptions, "storage"> = {},
): number => {
  const storage = getStorage(options.storage);
  const valid = new Set(validProjectIds);
  let repaired = 0;
  const files = readFiles(storage).map((file) => {
    if (typeof file.projectId === "string" && valid.has(file.projectId)) {
      return file;
    }
    repaired += 1;
    return { ...file, projectId: fallbackProjectId };
  });
  if (repaired > 0) {
    writeFiles(storage, files);
  }
  return repaired;
};

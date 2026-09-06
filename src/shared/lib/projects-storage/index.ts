import { deleteEditableFilesByProject } from "@/shared/lib/editable-files-storage";
import type { MetadataConfigTemplate, ProjectRecord } from "@/shared/types";

import {
  createProjectId,
  defaultTimestamp,
  getStorage,
  normalizeProjectName,
  readProjects,
  sortOldestFirst,
  writeProjects,
} from "./helpers";
import type { ProjectDraft, ProjectStorageOptions } from "./types";

export {
  DEFAULT_PROJECT_NAME,
  LEGACY_METADATA_CONFIG_KEY,
  PROJECTS_STORAGE_KEY,
  UNTITLED_PROJECT_NAME,
} from "./constants";
export { migrateStorage } from "./migrate";
export type { ProjectDraft, ProjectStorageOptions } from "./types";

export const listProjects = (
  options: Pick<ProjectStorageOptions, "storage"> = {},
): ProjectRecord[] =>
  sortOldestFirst(readProjects(getStorage(options.storage)));

export const getProject = (
  id: string,
  options: Pick<ProjectStorageOptions, "storage"> = {},
): ProjectRecord | null =>
  readProjects(getStorage(options.storage)).find(
    (project) => project.id === id,
  ) ?? null;

export const createProject = (
  draft: ProjectDraft,
  options: ProjectStorageOptions = {},
): ProjectRecord => {
  const storage = getStorage(options.storage);
  const timestamp = options.now?.() ?? defaultTimestamp();
  const record: ProjectRecord = {
    id: options.createId?.() ?? createProjectId(),
    name: normalizeProjectName(draft.name),
    source: { kind: "local" },
    metadataConfig: draft.metadataConfig ?? { config: [] },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  writeProjects(storage, [...readProjects(storage), record]);
  return record;
};

const updateProject = (
  id: string,
  patch: Partial<Pick<ProjectRecord, "name" | "metadataConfig">>,
  options: Omit<ProjectStorageOptions, "createId">,
) => {
  const storage = getStorage(options.storage);
  const updatedAt = options.now?.() ?? defaultTimestamp();
  writeProjects(
    storage,
    readProjects(storage).map((project) =>
      project.id === id ? { ...project, ...patch, updatedAt } : project,
    ),
  );
};

export const renameProject = (
  id: string,
  name: string,
  options: Omit<ProjectStorageOptions, "createId"> = {},
) => {
  const nextName = name.trim();
  if (!nextName) return;
  updateProject(id, { name: nextName }, options);
};

export const updateProjectMetadataConfig = (
  id: string,
  metadataConfig: MetadataConfigTemplate,
  options: Omit<ProjectStorageOptions, "createId"> = {},
) => updateProject(id, { metadataConfig }, options);

/**
 * Removes a project and every editable file inside it. The app relies on at
 * least one project existing (imports always need a target), so deleting the
 * last one is refused rather than leaving storage in an unusable state.
 */
export const deleteProject = (
  id: string,
  options: Pick<ProjectStorageOptions, "storage"> = {},
) => {
  const storage = getStorage(options.storage);
  const projects = readProjects(storage);
  if (projects.length <= 1 && projects.some((project) => project.id === id)) {
    throw new Error("Cannot delete the only project");
  }
  deleteEditableFilesByProject(id, { storage });
  writeProjects(
    storage,
    projects.filter((project) => project.id !== id),
  );
};

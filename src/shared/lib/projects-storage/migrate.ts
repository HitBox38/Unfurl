import { repairFileProjectIds } from "@/shared/lib/editable-files-storage";
import { isMetadataConfigTemplate } from "@/shared/lib/is-metadata-config-template";
import type { MetadataConfigTemplate, ProjectRecord } from "@/shared/types";

import { DEFAULT_PROJECT_NAME, LEGACY_METADATA_CONFIG_KEY } from "./constants";
import {
  createProjectId,
  defaultTimestamp,
  getStorage,
  readProjects,
  sortOldestFirst,
  writeProjects,
} from "./helpers";
import type { ProjectStorageOptions } from "./types";

/**
 * Before projects existed, the metadata config lived under a single global
 * key. Consume it here so the first project inherits it, then delete the key
 * so nothing keeps reading a stale copy.
 */
const takeLegacyMetadataConfig = (storage: Storage): MetadataConfigTemplate => {
  const raw = storage.getItem(LEGACY_METADATA_CONFIG_KEY);
  if (raw === null) return { config: [] };
  storage.removeItem(LEGACY_METADATA_CONFIG_KEY);
  try {
    const parsed: unknown = JSON.parse(raw);
    return isMetadataConfigTemplate(parsed) ? parsed : { config: [] };
  } catch {
    return { config: [] };
  }
};

/**
 * Brings persisted data up to the current shape. Safe to run on every boot:
 * guarantees at least one project exists, folds the legacy global metadata
 * config into the first project, and points every editable file at a project
 * that actually exists.
 */
export const migrateStorage = (
  options: ProjectStorageOptions = {},
): ProjectRecord[] => {
  const storage = getStorage(options.storage);
  let projects = sortOldestFirst(readProjects(storage));

  if (projects.length === 0) {
    const timestamp = options.now?.() ?? defaultTimestamp();
    const defaultProject: ProjectRecord = {
      id: options.createId?.() ?? createProjectId(),
      name: DEFAULT_PROJECT_NAME,
      source: { kind: "local" },
      metadataConfig: takeLegacyMetadataConfig(storage),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    projects = [defaultProject];
    writeProjects(storage, projects);
  } else if (storage.getItem(LEGACY_METADATA_CONFIG_KEY) !== null) {
    // Projects already exist, so the legacy key is just leftover state.
    storage.removeItem(LEGACY_METADATA_CONFIG_KEY);
  }

  repairFileProjectIds(
    projects.map((project) => project.id),
    projects[0].id,
    { storage },
  );

  return projects;
};

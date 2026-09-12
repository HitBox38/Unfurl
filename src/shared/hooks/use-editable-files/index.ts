import { useMemo } from "react";

import { useStorageSnapshot } from "@/shared/hooks/use-storage-snapshot";
import {
  EDITABLE_FILES_STORAGE_KEY,
  listEditableFiles,
  type EditableFileRecord,
} from "@/shared/lib/editable-files-storage";

/**
 * Live view of the persisted editable files, newest first. Pass a project id
 * to narrow the list to that project.
 */
export const useEditableFiles = (projectId?: string): EditableFileRecord[] => {
  const snapshot = useStorageSnapshot(EDITABLE_FILES_STORAGE_KEY);

  return useMemo(() => {
    // `snapshot` is only here to invalidate the memo; the storage module owns parsing.
    void snapshot;
    const files = listEditableFiles();
    return projectId
      ? files.filter((file) => file.projectId === projectId)
      : files;
  }, [projectId, snapshot]);
};

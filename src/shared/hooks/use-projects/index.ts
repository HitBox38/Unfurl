import { useMemo } from "react";

import { useStorageSnapshot } from "@/shared/hooks/use-storage-snapshot";
import {
  PROJECTS_STORAGE_KEY,
  listProjects,
} from "@/shared/lib/projects-storage";
import type { ProjectRecord } from "@/shared/types";

/** Live view of every project, oldest first. */
export const useProjects = (): ProjectRecord[] => {
  const snapshot = useStorageSnapshot(PROJECTS_STORAGE_KEY);

  return useMemo(() => {
    void snapshot;
    return listProjects();
  }, [snapshot]);
};

/** Live view of a single project; `null` when the id is unknown or absent. */
export const useProject = (
  projectId: string | null | undefined,
): ProjectRecord | null => {
  const projects = useProjects();

  return useMemo(
    () =>
      projectId
        ? (projects.find((project) => project.id === projectId) ?? null)
        : null,
    [projectId, projects],
  );
};

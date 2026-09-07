import type { EditableFileRecord } from "@/shared/lib/editable-files-storage";
import type { ProjectRecord } from "@/shared/types";

export interface ProjectSummary {
  fileCount: number;
  fieldCount: number;
  /** Latest of the project's own edits and any of its files' edits. */
  lastEditedAt: number;
}

export const summarizeProject = (
  project: ProjectRecord,
  files: readonly EditableFileRecord[],
): ProjectSummary => ({
  fileCount: files.length,
  fieldCount: project.metadataConfig.config.length,
  lastEditedAt: files.reduce(
    (latest, file) => Math.max(latest, file.updatedAt),
    project.updatedAt,
  ),
});

/** Groups files under their project id; every project gets an entry. */
export const groupFilesByProject = (
  projects: readonly ProjectRecord[],
  files: readonly EditableFileRecord[],
): Map<string, EditableFileRecord[]> => {
  const groups = new Map<string, EditableFileRecord[]>(
    projects.map((project) => [project.id, []]),
  );
  for (const file of files) {
    groups.get(file.projectId)?.push(file);
  }
  return groups;
};

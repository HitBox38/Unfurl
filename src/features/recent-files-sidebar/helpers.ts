import type { EditableFileRecord } from "@/shared/lib/editable-files-storage";
import type { ProjectRecord } from "@/shared/types";

export interface SidebarGroupView {
  project: ProjectRecord;
  files: EditableFileRecord[];
}

const normalize = (value: string) => value.trim().toLowerCase();

export const fileMatchesQuery = (
  file: EditableFileRecord,
  query: string,
): boolean => {
  const q = normalize(query);
  if (!q) return true;
  const haystack = [file.name, file.content.title, file.fileType]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
};

export const buildSidebarGroups = (
  projects: readonly ProjectRecord[],
  filesByProject: Map<string, EditableFileRecord[]>,
  query: string,
): SidebarGroupView[] => {
  const q = normalize(query);
  return projects.flatMap((project) => {
    const files = filesByProject.get(project.id) ?? [];
    if (!q) return [{ project, files }];
    const projectMatches = project.name.toLowerCase().includes(q);
    const matchingFiles = files.filter((item) => fileMatchesQuery(item, q));
    if (!projectMatches && matchingFiles.length === 0) return [];
    return [{ project, files: projectMatches ? files : matchingFiles }];
  });
};

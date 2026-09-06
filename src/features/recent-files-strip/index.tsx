import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { FileTypeBadge, FileTypeIcon } from "@/shared/components";
import { useEditableFiles, useProjects } from "@/shared/hooks";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";

import { DEFAULT_RECENT_FILES_LIMIT } from "./constants";

interface RecentFilesStripProps {
  limit?: number;
}

/** Cross-project list of the most recently edited files; empty when none exist. */
export const RecentFilesStrip = ({
  limit = DEFAULT_RECENT_FILES_LIMIT,
}: RecentFilesStripProps) => {
  const files = useEditableFiles();
  const projects = useProjects();
  const projectNames = useMemo(
    () => new Map(projects.map((project) => [project.id, project.name])),
    [projects],
  );
  const recent = files.slice(0, limit);

  if (recent.length === 0) return null;

  return (
    <ul className="flex flex-col">
      {recent.map((file) => (
        <li key={file.id}>
          <Link
            to="/files/$fileId"
            params={{ fileId: file.id }}
            className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <FileTypeIcon
              fileType={file.fileType}
              className="shrink-0 text-muted-foreground"
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium" title={file.name}>
              {file.name}
            </span>
            <FileTypeBadge fileType={file.fileType} />
            <span className="hidden min-w-0 truncate text-sm text-muted-foreground sm:inline">
              {projectNames.get(file.projectId) ?? "Unknown project"}
            </span>
            <span className="shrink-0 text-sm text-muted-foreground">
              {formatRelativeTime(file.updatedAt)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

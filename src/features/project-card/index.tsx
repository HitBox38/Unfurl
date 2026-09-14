import { Link } from "@tanstack/react-router";
import { ArrowUpRight, FolderOpen } from "lucide-react";
import { useState, type DragEvent } from "react";

import type { ImportFilesResult } from "@/features/file-import";
import { useImportFiles } from "@/features/file-import/hooks/use-import-files";
import { cn } from "@/shared/lib/cn";
import type { EditableFileRecord } from "@/shared/lib/editable-files-storage";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import { summarizeProject } from "@/shared/lib/project-summary";
import type { ProjectRecord } from "@/shared/types";

interface ProjectCardProps {
  project: ProjectRecord;
  files: readonly EditableFileRecord[];
}

const pluralize = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;

const describeDropOutcome = (result: ImportFilesResult) => {
  const parts = [`Imported ${result.imported.length}`];
  if (result.failed.length > 0) {
    parts.push(`${result.failed.length} failed: ${result.failed[0].reason}`);
  }
  if (result.skipped.length > 0) {
    parts.push(`${result.skipped.length} unsupported`);
  }
  return parts.join(" · ");
};

export const ProjectCard = ({ project, files }: ProjectCardProps) => {
  const { importFiles } = useImportFiles();
  const [isDragging, setIsDragging] = useState(false);
  const [dropOutcome, setDropOutcome] = useState<ImportFilesResult | null>(null);
  const { fileCount, fieldCount, lastEditedAt } = summarizeProject(project, files);

  const onDrop = async (event: DragEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(event.dataTransfer.files);
    if (dropped.length === 0) return;
    const result = await importFiles({
      files: dropped,
      projectId: project.id,
      metadataConfig: project.metadataConfig,
    });
    setDropOutcome(result);
  };

  return (
    <div className="flex flex-col">
      <Link
        to="/projects/$projectId"
        params={{ projectId: project.id }}
        aria-label={project.name}
        data-dragging={isDragging || undefined}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => void onDrop(event)}
        className={cn(
          "workspace-bubble group flex min-w-0 items-center gap-4 p-5 outline-none transition-[border-color,box-shadow] hover:border-primary/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50",
          isDragging && "bg-primary/5 ring-1 ring-primary",
        )}
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:text-chart-1">
          <FolderOpen className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <span className="block truncate font-medium">{project.name}</span>
          <span className="block text-xs leading-relaxed text-muted-foreground">
            {pluralize(fileCount, "file")}
            {fieldCount > 0 ? (
              <>
                <span aria-hidden="true"> · </span>
                {pluralize(fieldCount, "metadata field")}
              </>
            ) : null}
          </span>
          <span className="block text-xs text-muted-foreground">
            {formatRelativeTime(lastEditedAt)}
          </span>
        </div>
        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary dark:group-hover:text-chart-1" aria-hidden="true" />
      </Link>
      {dropOutcome ? (
        <p
          role="status"
          className={cn(
            "px-2 pb-2 text-xs",
            dropOutcome.failed.length > 0
              ? "text-destructive"
              : "text-muted-foreground",
          )}
        >
          {describeDropOutcome(dropOutcome)}
        </p>
      ) : null}
    </div>
  );
};

import { Link } from "@tanstack/react-router";

import { FileTypeBadge, FileTypeIcon } from "@/shared/components";
import type { EditableFileRecord } from "@/shared/lib/editable-files-storage";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import type { ProjectRecord } from "@/shared/types";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";

import { FileActionsMenu } from "./components/file-actions-menu";

interface FileCardProps {
  file: EditableFileRecord;
  /** Every project, used to offer "Move to…" destinations. */
  projects: readonly ProjectRecord[];
}

const pluralize = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;

export const FileCard = ({ file, projects }: FileCardProps) => {
  const subtitle =
    file.content.title && file.content.title !== file.name
      ? file.content.title
      : null;

  return (
    <Card size="sm" className="transition-[box-shadow] hover:ring-primary/40 hover:shadow-lg">
      <CardHeader className="flex items-start gap-3">
        <span className="rounded-lg bg-muted p-2 text-muted-foreground">
          <FileTypeIcon fileType={file.fileType} />
        </span>
        <div className="grid min-w-0 flex-1 gap-0.5">
          <Link
            to="/files/$fileId"
            params={{ fileId: file.id }}
            className="truncate font-heading text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            title={file.name}
          >
            {file.name}
          </Link>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground" title={subtitle}>
              {subtitle}
            </p>
          ) : null}
        </div>
        <FileActionsMenu file={file} projects={projects} />
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <FileTypeBadge fileType={file.fileType} />
        <span>{pluralize(file.content.nodes.length, "node")}</span>
        <span aria-hidden="true">·</span>
        <span>{formatRelativeTime(file.updatedAt)}</span>
      </CardContent>
    </Card>
  );
};

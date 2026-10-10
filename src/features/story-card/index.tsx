import { Link } from "@tanstack/react-router";

import { FileTypeBadge } from "@/shared/components";
import { trackEvent } from "@/shared/lib/analytics";
import type { EditableFileRecord } from "@/shared/lib/editable-files-storage";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import type { ProjectRecord } from "@/shared/types";
import { MiniGraph } from "@/features/story-card/components/mini-graph";

interface StoryCardProps {
  file: EditableFileRecord;
  project: ProjectRecord | undefined;
}

export const StoryCard = ({ file, project }: StoryCardProps) => {
  const projectName = project?.name ?? "Unknown project";

  return (
    <Link
      to="/files/$fileId"
      params={{ fileId: file.id }}
      onClick={() => trackEvent("recent_file_opened", {})}
      className="workspace-bubble group block overflow-hidden rounded-3xl p-2 outline-none transition-[border-color,box-shadow] hover:border-primary/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <MiniGraph file={file} />
      <div className="grid gap-4 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-heading text-base font-medium">
            {file.name}
          </h3>
          <p className="mt-1.5 truncate text-xs text-muted-foreground">
            {projectName} - {formatRelativeTime(file.updatedAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <FileTypeBadge fileType={file.fileType} />
          <span>{file.content.nodes.length} nodes</span>
        </div>
      </div>
    </Link>
  );
};

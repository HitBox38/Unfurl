import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Trash2 } from "lucide-react";

import { MetadataConfig } from "@/features/metadata-config";
import { InlineNameInput, SourceBadge } from "@/shared/components";
import { useConfirmDialog } from "@/shared/hooks";
import { deleteProject, renameProject } from "@/shared/lib/projects-storage";
import type { ProjectRecord } from "@/shared/types";
import { Button } from "@/shared/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/tooltip";

interface ProjectHeaderProps {
  project: ProjectRecord;
  fileCount: number;
  /** False for the last remaining project, which the app refuses to delete. */
  canDelete: boolean;
}

const pluralize = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;

export const ProjectHeader = ({
  project,
  fileCount,
  canDelete,
}: ProjectHeaderProps) => {
  const navigate = useNavigate();
  const confirm = useConfirmDialog();

  const requestDelete = () =>
    confirm({
      title: `Delete "${project.name}"?`,
      description: `This removes the project and its ${pluralize(fileCount, "file")}. This cannot be undone.`,
      confirmLabel: "Delete project",
      onConfirm: () => {
        deleteProject(project.id);
        void navigate({ to: "/" });
      },
    });

  return (
    <header className="sticky top-0 z-10 flex flex-col gap-2 border-b bg-background/80 px-6 py-3 backdrop-blur">
      <Link
        to="/"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Projects
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <InlineNameInput
          key={project.id + project.name}
          id="project-name"
          label="Project name"
          name={project.name}
          onCommit={(name) => renameProject(project.id, name)}
          className="text-2xl md:text-2xl"
        />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{pluralize(fileCount, "file")}</span>
          <SourceBadge />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <MetadataConfig project={project} />
          <Tooltip>
            <TooltipTrigger asChild>
              {/* Disabled buttons swallow pointer events; the span keeps the tooltip reachable. */}
              <span className="inline-flex">
                <Button
                  variant="secondary"
                  size="icon-sm"
                  aria-label="Delete project"
                  disabled={!canDelete}
                  onClick={requestDelete}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {canDelete
                ? "Delete project"
                : "The only project can't be deleted"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};

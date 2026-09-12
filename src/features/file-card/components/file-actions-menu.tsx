import { useNavigate } from "@tanstack/react-router";
import {
  Download,
  ExternalLink,
  FolderInput,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { useConfirmDialog } from "@/shared/hooks";
import { downloadStoryAsJson } from "@/shared/lib/download-story-json";
import {
  deleteEditableFile,
  moveEditableFile,
  type EditableFileRecord,
} from "@/shared/lib/editable-files-storage";
import type { ProjectRecord } from "@/shared/types";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import { useRenameFileModal } from "../hooks/use-rename-file-modal";

interface FileActionsMenuProps {
  file: EditableFileRecord;
  projects: readonly ProjectRecord[];
}

export const FileActionsMenu = ({ file, projects }: FileActionsMenuProps) => {
  const navigate = useNavigate();
  const confirm = useConfirmDialog();
  const openRename = useRenameFileModal();
  const destinations = projects.filter((project) => project.id !== file.projectId);

  const requestDelete = () =>
    confirm({
      title: `Delete "${file.name}"?`,
      description: "The file is removed from this browser. This cannot be undone.",
      confirmLabel: "Delete file",
      onConfirm: () => deleteEditableFile(file.id),
    });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for ${file.name}`}
          className="-mr-1 -mt-1 shrink-0"
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={() =>
            void navigate({ to: "/files/$fileId", params: { fileId: file.id } })
          }
        >
          <ExternalLink aria-hidden="true" />
          Open
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => openRename(file)}>
          <Pencil aria-hidden="true" />
          Rename…
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={destinations.length === 0}>
            <FolderInput aria-hidden="true" />
            Move to…
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {destinations.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onSelect={() => moveEditableFile(file.id, project.id)}
              >
                {project.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem
          onSelect={() => downloadStoryAsJson(file.name, file.content)}
        >
          <Download aria-hidden="true" />
          Export JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={requestDelete}>
          <Trash2 aria-hidden="true" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

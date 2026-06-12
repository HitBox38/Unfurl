import { Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";

import type { EditableFileRecord } from "@/shared/lib/editable-files-storage";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";

import { formatUpdatedAt } from "../helpers";

interface Props {
  file: EditableFileRecord;
}

export const RecentFileLink = ({ file }: Props) => (
  <SidebarMenuItem>
    <SidebarMenuButton asChild tooltip={file.name} className="h-auto min-h-10">
      <Link
        to="/files/$fileId"
        params={{ fileId: file.id }}
        activeProps={{
          className: "bg-sidebar-accent text-sidebar-accent-foreground",
        }}
      >
        <FileText className="size-4" />
        <span className="min-w-0">
          <span className="block truncate font-medium">{file.name}</span>
          {file.content.title ? (
            <span className="block truncate text-xs text-sidebar-foreground/70">
              {file.content.title}
            </span>
          ) : null}
          <span className="mt-0.5 block truncate text-xs uppercase tracking-wide text-sidebar-foreground/70">
            {file.fileType} - {formatUpdatedAt(file.updatedAt)}
          </span>
        </span>
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
);

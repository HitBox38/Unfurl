import { Link } from "@tanstack/react-router";

import type { EditableFileRecord } from "@/shared/lib/editable-files-storage";
import type { ProjectRecord } from "@/shared/types";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/shared/ui/sidebar";

import { RecentFileLink } from "./recent-file-link";

interface Props {
  project: ProjectRecord;
  files: readonly EditableFileRecord[];
}

export const ProjectFilesGroup = ({ project, files }: Props) => (
  <SidebarGroup className="gap-0 py-1 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-1">
    <SidebarGroupLabel asChild>
      <Link
        to="/projects/$projectId"
        params={{ projectId: project.id }}
        className="text-xs font-medium text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"
      >
        {project.name}
      </Link>
    </SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:items-center">
        {files.map((file) => (
          <RecentFileLink key={file.id} file={file} />
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);

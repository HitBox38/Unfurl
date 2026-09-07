import { Link } from "@tanstack/react-router";

import { FileTypeBadge, FileTypeIcon } from "@/shared/components";
import type { EditableFileRecord } from "@/shared/lib/editable-files-storage";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/sidebar";

interface Props {
  file: EditableFileRecord;
}

export const RecentFileLink = ({ file }: Props) => {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
      <SidebarMenuButton
        asChild
        tooltip={file.name}
        className="group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!"
      >
        <Link
          to="/files/$fileId"
          params={{ fileId: file.id }}
          onClick={() => {
            if (isMobile) setOpenMobile(false);
          }}
          activeProps={{
            className:
              "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
          }}
        >
          <FileTypeIcon fileType={file.fileType} />
          <span className="min-w-0 flex-1 truncate font-medium group-data-[collapsible=icon]:hidden">
            {file.name}
          </span>
          <FileTypeBadge
            fileType={file.fileType}
            className="group-data-[collapsible=icon]:hidden"
          />
          <span className="shrink-0 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
            {formatRelativeTime(file.updatedAt)}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

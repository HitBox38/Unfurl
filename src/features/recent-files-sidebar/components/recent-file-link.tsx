import { Link } from "@tanstack/react-router";

import { FileTypeBadge, FileTypeIcon } from "@/shared/components";
import type { EditableFileRecord } from "@/shared/lib/editable-files-storage";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import { trackEvent } from "@/shared/lib/analytics";
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
        className="h-auto min-h-11 rounded-xl px-3 py-2.5 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:min-h-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!"
      >
        <Link
          to="/files/$fileId"
          params={{ fileId: file.id }}
          aria-label={file.name}
          onClick={() => {
            trackEvent("recent_file_opened", {});
            if (isMobile) setOpenMobile(false);
          }}
          activeProps={{
            className:
              "bg-primary/10 font-medium text-primary dark:text-chart-1",
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
          <span className="sr-only">
            {formatRelativeTime(file.updatedAt)}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

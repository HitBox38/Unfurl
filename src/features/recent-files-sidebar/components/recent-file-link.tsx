import { Link } from "@tanstack/react-router";
import { FileCode, FileJson, FileText, type LucideIcon } from "lucide-react";

import type { EditableFileRecord } from "@/shared/lib/editable-files-storage";
import type { SupportedFileType } from "@/shared/types";
import { Badge } from "@/shared/ui/badge";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/sidebar";

import { formatUpdatedAt } from "../helpers";

const FILE_TYPE_ICONS: Record<SupportedFileType, LucideIcon> = {
  twee: FileText,
  json: FileJson,
  md: FileCode,
};

interface Props {
  file: EditableFileRecord;
}

export const RecentFileLink = ({ file }: Props) => {
  const { isMobile, setOpenMobile } = useSidebar();
  const Icon = FILE_TYPE_ICONS[file.fileType] ?? FileText;
  const subtitle =
    file.content.title && file.content.title !== file.name
      ? file.content.title
      : null;
  const tooltipLabel = subtitle ? `${file.name} — ${subtitle}` : file.name;

  return (
    <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
      <SidebarMenuButton
        asChild
        size="lg"
        tooltip={tooltipLabel}
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
          <Icon className="size-4" />
          <span className="grid min-w-0 flex-1 gap-1 group-data-[collapsible=icon]:hidden">
            <span className="truncate font-medium" title={file.name}>
              {file.name}
            </span>
            <span className="flex min-w-0 items-center gap-1.5 text-xs text-sidebar-foreground/70">
              <Badge
                variant="secondary"
                className="h-4 px-1.5 text-[0.625rem] tracking-wide uppercase"
              >
                {file.fileType}
              </Badge>
              <span className="truncate" title={subtitle ?? undefined}>
                {subtitle ?? formatUpdatedAt(file.updatedAt)}
              </span>
            </span>
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

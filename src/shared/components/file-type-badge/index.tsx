import { FileCode, FileJson, FileText, type LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import type { SupportedFileType } from "@/shared/types";
import { Badge } from "@/shared/ui/badge";

const FILE_TYPE_ICONS: Record<SupportedFileType, LucideIcon> = {
  twee: FileText,
  json: FileJson,
  md: FileCode,
};

interface FileTypeIconProps {
  fileType: SupportedFileType;
  className?: string;
}

export const FileTypeIcon = ({ fileType, className }: FileTypeIconProps) => {
  const Icon = FILE_TYPE_ICONS[fileType] ?? FileText;
  return <Icon className={cn("size-4", className)} aria-hidden="true" />;
};

interface FileTypeBadgeProps {
  fileType: SupportedFileType;
  className?: string;
}

/** Tiny uppercase pill used wherever a file's format is shown. */
export const FileTypeBadge = ({ fileType, className }: FileTypeBadgeProps) => (
  <Badge
    variant="secondary"
    className={cn("h-4 px-1.5 text-[0.625rem] tracking-wide uppercase", className)}
  >
    {fileType}
  </Badge>
);

/** Same pill for a project's storage source. */
export const SourceBadge = ({ className }: { className?: string }) => (
  <Badge
    variant="secondary"
    className={cn("h-4 px-1.5 text-[0.625rem] tracking-wide uppercase", className)}
  >
    local
  </Badge>
);

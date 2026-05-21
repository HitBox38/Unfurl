import { Link } from "@tanstack/react-router";
import { FileText, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  EDITABLE_FILES_STORAGE_KEY,
  searchEditableFiles,
  type EditableFileRecord,
} from "@/features/recent-files";
import { STORAGE_EVENT } from "@/shared/hooks";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/shared/ui/sidebar";

const formatUpdatedAt = (updatedAt: number) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(updatedAt));

export const RecentFilesSidebar = () => {
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState<EditableFileRecord[]>(() =>
    searchEditableFiles(""),
  );

  const refreshFiles = useCallback(() => {
    setFiles(searchEditableFiles(query));
  }, [query]);

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  useEffect(() => {
    const onStorageChange = (
      event: CustomEvent<{ key: string; newValue: EditableFileRecord[] }>,
    ) => {
      if (event.detail.key === EDITABLE_FILES_STORAGE_KEY) {
        setFiles(
          query.trim()
            ? searchEditableFiles(query)
            : [...event.detail.newValue].sort(
              (a, b) => b.updatedAt - a.updatedAt,
            ),
        );
      }
    };
    const onNativeStorage = (event: StorageEvent) => {
      if (event.key === EDITABLE_FILES_STORAGE_KEY) {
        refreshFiles();
      }
    };

    window.addEventListener(STORAGE_EVENT, onStorageChange as EventListener);
    window.addEventListener("storage", onNativeStorage);
    return () => {
      window.removeEventListener(STORAGE_EVENT, onStorageChange as EventListener);
      window.removeEventListener("storage", onNativeStorage);
    };
  }, [query, refreshFiles]);

  return (
    <Sidebar collapsible="icon" aria-label="Editable files sidebar">
      <SidebarHeader>
        <div className="px-2 py-1 group-data-[collapsible=icon]:hidden">
          <h2 className="text-lg font-semibold">Unfurl</h2>
        </div>
        <label className="relative block px-2 group-data-[collapsible=icon]:hidden">
          <Search className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-sidebar-foreground/70" />
          <SidebarInput
            aria-label="Search editable files"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search files"
            className="pl-9"
          />
        </label>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Past files</SidebarGroupLabel>
          <SidebarGroupContent>
            <nav aria-label="Editable files">
              <SidebarMenu>
                {files.length > 0 ? (
                  files.map((file) => (
                    <RecentFileLink key={file.id} file={file} />
                  ))
                ) : (
                  <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
                    <p className="rounded-lg border border-dashed p-3 text-sm text-sidebar-foreground/70">
                      {query.trim()
                        ? "No editable files match your search."
                        : "Uploaded files will appear here."}
                    </p>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
};

const RecentFileLink = ({ file }: { file: EditableFileRecord }) => (
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

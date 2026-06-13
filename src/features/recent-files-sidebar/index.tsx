import { Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  EDITABLE_FILES_STORAGE_KEY,
  listEditableFiles,
  type EditableFileRecord,
} from "@/shared/lib/editable-files-storage";
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
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/shared/ui/sidebar";

import { RecentFileLink } from "./components/recent-file-link";
import { sortFilesNewestFirst } from "./helpers";

export const RecentFilesSidebar = () => {
  const [query, setQuery] = useState("");
  const [allFiles, setAllFiles] = useState<EditableFileRecord[]>(() =>
    listEditableFiles(),
  );
  const normalizedQuery = query.trim().toLowerCase();
  const files = useMemo(() => {
    if (!normalizedQuery) return allFiles;

    return allFiles.filter((file) => {
      const searchable = [file.name, file.content.title, file.fileType]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [allFiles, normalizedQuery]);

  const refreshFiles = useCallback(() => {
    setAllFiles(listEditableFiles());
  }, []);

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  useEffect(() => {
    const onStorageChange = (
      event: CustomEvent<{ key: string; newValue: EditableFileRecord[] }>,
    ) => {
      if (event.detail.key === EDITABLE_FILES_STORAGE_KEY) {
        setAllFiles(sortFilesNewestFirst(event.detail.newValue));
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
  }, [refreshFiles]);

  const hasQuery = query.trim().length > 0;

  return (
    <Sidebar collapsible="icon" aria-label="Editable files sidebar">
      <SidebarHeader className="group-data-[collapsible=icon]:p-1">
        <div className="flex items-center justify-between gap-2 px-2 py-1 group-data-[collapsible=icon]:hidden">
          <Link
            to="/"
            aria-label="Go to home page"
            className="rounded-md text-lg font-semibold transition-colors hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            Unfurl
          </Link>
          <SidebarTrigger aria-label="Collapse sidebar" />
        </div>
        <div className="hidden justify-center group-data-[collapsible=icon]:flex">
          <SidebarTrigger aria-label="Expand sidebar" />
        </div>
        <label
          htmlFor="editable-files-search"
          className="relative block px-2 group-data-[collapsible=icon]:hidden"
        >
          <Search className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-sidebar-foreground/70" />
          <SidebarInput
            id="editable-files-search"
            aria-label="Search editable files"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search files"
            className="px-9"
          />
          {hasQuery ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </label>
      </SidebarHeader>
      <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />
      <SidebarContent className="group-data-[collapsible=icon]:overflow-hidden">
        <SidebarGroup className="gap-2 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-1">
          <SidebarGroupLabel>
            Recent files{allFiles.length > 0 ? ` (${allFiles.length})` : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <nav aria-label="Editable files">
              <SidebarMenu className="gap-2 group-data-[collapsible=icon]:gap-1 group-data-[collapsible=icon]:items-center">
                {files.length > 0 ? (
                  files.map((file) => (
                    <RecentFileLink key={file.id} file={file} />
                  ))
                ) : (
                  <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
                    {hasQuery ? (
                      <div className="flex flex-col items-start gap-2 p-3 text-sm text-sidebar-foreground/70">
                        <p>No files match your search.</p>
                        <button
                          type="button"
                          onClick={() => setQuery("")}
                          className="rounded-sm font-medium text-sidebar-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                        >
                          Clear search
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-1 rounded-lg border border-dashed p-3 text-sm text-sidebar-foreground/70">
                        <p>No files yet.</p>
                        <Link
                          to="/"
                          className="rounded-sm font-medium text-sidebar-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                        >
                          Upload a file to get started
                        </Link>
                      </div>
                    )}
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

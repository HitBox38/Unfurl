import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
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
  SidebarRail,
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

  return (
    <Sidebar collapsible="icon" aria-label="Editable files sidebar">
      <SidebarHeader>
        <div className="px-2 py-1 group-data-[collapsible=icon]:hidden">
          <Link
            to="/"
            aria-label="Go to home page"
            className="block rounded-md text-lg font-semibold transition-colors hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            Unfurl
          </Link>
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

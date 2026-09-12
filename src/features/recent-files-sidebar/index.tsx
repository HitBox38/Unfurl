import { Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { useEditableFiles, useProjects } from "@/shared/hooks";
import { groupFilesByProject } from "@/shared/lib/project-summary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInput,
  SidebarSeparator,
} from "@/shared/ui/sidebar";

import { ProjectFilesGroup } from "./components/project-files-group";
import { ThemeToggleButton } from "./components/theme-toggle-button";
import { buildSidebarGroups } from "./helpers";

export const RecentFilesSidebar = () => {
  const projects = useProjects();
  const files = useEditableFiles();
  const [query, setQuery] = useState("");
  const filesByProject = useMemo(
    () => groupFilesByProject(projects, files),
    [files, projects],
  );
  const groups = useMemo(
    () => buildSidebarGroups(projects, filesByProject, query),
    [filesByProject, projects, query],
  );
  const hasQuery = query.trim().length > 0;
  const showImportEmpty = !hasQuery && projects.length === 0;
  const showSearchEmpty = hasQuery && groups.length === 0;

  return (
    <Sidebar collapsible="icon" aria-label="Editable files sidebar">
      <SidebarHeader className="group-data-[collapsible=icon]:hidden">
        <label
          htmlFor="editable-files-search"
          className="relative block px-2"
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
        <nav aria-label="Editable files">
          {showImportEmpty ? (
            <div className="flex flex-col items-start gap-1 rounded-lg border border-dashed p-3 text-sm text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
              <p>No files yet.</p>
              <Link
                to="/"
                className="rounded-sm font-medium text-sidebar-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              >
                Import a file to get started
              </Link>
            </div>
          ) : null}
          {showSearchEmpty ? (
            <div className="flex flex-col items-start gap-2 p-3 text-sm text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
              <p>No files match your search.</p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="rounded-sm font-medium text-sidebar-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              >
                Clear search
              </button>
            </div>
          ) : null}
          {groups.map((group) => (
            <ProjectFilesGroup
              key={group.project.id}
              project={group.project}
              files={group.files}
            />
          ))}
        </nav>
      </SidebarContent>
      <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />
      <SidebarFooter className="group-data-[collapsible=icon]:p-1">
        <p className="px-2 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
          v{__APP_VERSION__}
        </p>
        <ThemeToggleButton />
      </SidebarFooter>
    </Sidebar>
  );
};

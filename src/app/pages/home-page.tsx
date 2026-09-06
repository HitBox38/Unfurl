import { useEffect, useMemo, useState } from "react";

import ItchIoLogo from "@/assets/itchio-logo.svg";
import { NewProjectButton } from "@/features/create-project";
import { DemoButton } from "@/features/demo";
import { useFaqModal } from "@/features/faq";
import { FileImportDropzone } from "@/features/file-import";
import { ProjectCard } from "@/features/project-card";
import { RecentFilesStrip } from "@/features/recent-files-strip";
import { useEditableFiles, useProjects } from "@/shared/hooks";
import {
  groupFilesByProject,
  summarizeProject,
} from "@/shared/lib/project-summary";
import {
  useDialogStore,
  useJsonDataStore,
  useNodeStore,
} from "@/shared/stores";
import type { ProjectRecord } from "@/shared/types";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

interface HomePageProps {
  isOnline: boolean;
}

const mostRecentlyEdited = (
  projects: readonly ProjectRecord[],
  filesByProject: Map<string, { updatedAt: number }[]>,
): ProjectRecord | undefined =>
  projects.reduce<ProjectRecord | undefined>((best, project) => {
    if (!best) return project;
    const bestEdited = summarizeProject(best, filesByProject.get(best.id) ?? []);
    const edited = summarizeProject(project, filesByProject.get(project.id) ?? []);
    return edited.lastEditedAt > bestEdited.lastEditedAt ? project : best;
  }, undefined);

export const HomePage = ({ isOnline }: HomePageProps) => {
  const setContent = useDialogStore((state) => state.setContent);
  const resetJson = useJsonDataStore((state) => state.reset);
  const setSelectedNode = useNodeStore((state) => state.setNode);
  const faqModal = useFaqModal();
  const projects = useProjects();
  const files = useEditableFiles();
  const [pickedProjectId, setPickedProjectId] = useState<string | null>(null);

  const filesByProject = useMemo(
    () => groupFilesByProject(projects, files),
    [files, projects],
  );

  // Fall back to the most recently edited project until the user picks one
  // (or if the picked one has since been deleted).
  const targetProject =
    projects.find((project) => project.id === pickedProjectId) ??
    mostRecentlyEdited(projects, filesByProject);

  useEffect(() => {
    resetJson();
    setSelectedNode(null);
  }, [resetJson, setSelectedNode]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto text-left">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b bg-background/80 px-6 py-3 backdrop-blur">
        <h1 className="font-heading text-lg font-medium">
          Unfurl{isOnline ? " Online" : ""}
        </h1>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <DemoButton />
          {isOnline ? (
            <Button asChild variant="secondary">
              <a
                href="https://hit-box38.itch.io/unfurl"
                target="_blank"
                rel="noreferrer"
              >
                <ItchIoLogo aria-hidden="true" />
                Get the Desktop version
              </a>
            </Button>
          ) : null}
          <Button variant="secondary" onClick={() => setContent(faqModal)}>
            FAQ
          </Button>
          <NewProjectButton />
        </div>
      </header>

      <div className="flex flex-col gap-6 px-6 py-5">
        <section aria-labelledby="projects-heading" className="flex flex-col gap-1">
          <h2
            id="projects-heading"
            className="text-sm font-medium text-muted-foreground"
          >
            Projects
          </h2>
          <ul className="flex flex-col">
            {projects.map((project) => (
              <li key={project.id}>
                <ProjectCard
                  project={project}
                  files={filesByProject.get(project.id) ?? []}
                />
              </li>
            ))}
          </ul>
        </section>

        {targetProject ? (
          <section aria-labelledby="import-heading" className="flex flex-col gap-2">
            <h2 id="import-heading" className="sr-only">
              Import files
            </h2>
            {projects.length > 1 ? (
              <div className="flex items-center gap-2">
                <Label htmlFor="import-target-project" className="text-muted-foreground">
                  Into
                </Label>
                <Select value={targetProject.id} onValueChange={setPickedProjectId}>
                  <SelectTrigger
                    id="import-target-project"
                    aria-label="Import into project"
                    className="w-48"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <FileImportDropzone key={targetProject.id} projectId={targetProject.id} />
          </section>
        ) : null}

        {files.length > 0 ? (
          <section aria-labelledby="recent-heading" className="flex flex-col gap-2">
            <h2
              id="recent-heading"
              className="text-sm font-medium text-muted-foreground"
            >
              Recent files
            </h2>
            <RecentFilesStrip />
          </section>
        ) : null}
      </div>
    </div>
  );
};

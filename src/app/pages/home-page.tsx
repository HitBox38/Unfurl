import { useEffect, useMemo, useState } from "react";

import ItchIoLogo from "@/assets/itchio-logo.svg";
import { NewStoryButton } from "@/features/new-story";
import { NewProjectButton } from "@/features/create-project";
import { DemoButton } from "@/features/demo";
import { useFaqModal } from "@/features/faq";
import { FileImportDropzone } from "@/features/file-import";
import { ProjectCard } from "@/features/project-card";
import { RecentFilesStrip } from "@/features/recent-files-strip";
import { StoryCard } from "@/features/story-card";
import { useEditableFiles, useProjects } from "@/shared/hooks";
import type { EditableFileRecord } from "@/shared/lib/editable-files-storage";
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
  filesByProject: Map<string, readonly EditableFileRecord[]>,
): ProjectRecord | undefined =>
  projects.reduce<ProjectRecord | undefined>((best, project) => {
    if (!best) return project;
    const bestEdited = summarizeProject(
      best,
      filesByProject.get(best.id) ?? [],
    );
    const edited = summarizeProject(
      project,
      filesByProject.get(project.id) ?? [],
    );
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
  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );
  const storyCards = files.slice(0, 2);

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
      <header className="library-header">
        <div className="min-w-0 flex-1 space-y-2">
          <h1 className="font-heading text-3xl font-medium tracking-tight">
            Unfurl{isOnline ? " Online" : ""}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A place for your stories to take shape.
          </p>
        </div>
        <div className="workspace-bubble workspace-toolbar flex-wrap">
          <NewProjectButton />
          <DemoButton project={targetProject} />

          <Button variant="secondary" onClick={() => setContent(faqModal)}>
            FAQ
          </Button>

          {isOnline ? (
            <Button
              asChild
              variant="link"
              className="basis-full justify-start px-0 text-muted-foreground sm:basis-auto"
            >
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
        </div>
      </header>

      <div className="library-content">
        {storyCards.length > 0 ? (
          <section
            aria-labelledby="story-cards-heading"
            className="flex flex-col gap-5"
          >
            <div>
              <h2
                id="story-cards-heading"
                className="text-lg font-medium"
              >
                Continue writing
              </h2>
              <p className="text-sm text-muted-foreground">
                Pick up where you left off.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {storyCards.map((file) => (
                <StoryCard
                  key={file.id}
                  file={file}
                  project={projectsById.get(file.projectId)}
                />
              ))}
            </div>
          </section>
        ) : null}
        <section
          aria-labelledby="projects-heading"
          className="flex flex-col gap-5"
        >
          <h2
            id="projects-heading"
            className="text-lg font-medium"
          >
            Projects
          </h2>
          <ul className="grid gap-4 xl:grid-cols-2">
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
          <section
            aria-labelledby="import-heading"
            className="workspace-bubble flex flex-col gap-5 p-5 sm:p-7"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 id="import-heading" className="text-lg font-medium">
                  Start a story
                </h2>
                <p className="text-sm text-muted-foreground">
                  Begin with a blank page or import an existing story.
                </p>
              </div>
              <NewStoryButton project={targetProject} />
            </div>
            {projects.length > 1 ? (
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="import-target-project"
                  className="text-muted-foreground"
                >
                  Into
                </Label>
                <Select
                  value={targetProject.id}
                  onValueChange={setPickedProjectId}
                >
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
            <FileImportDropzone
              key={targetProject.id}
              projectId={targetProject.id}
            />
          </section>
        ) : null}

        {files.length > 0 ? (
          <section
            aria-labelledby="recent-heading"
            className="flex flex-col gap-4"
          >
            <h2
              id="recent-heading"
              className="text-sm font-medium text-muted-foreground"
            >
              Recent files
            </h2>
            <RecentFilesStrip />
          </section>
        ) : null}
        {isOnline ? (
          <aside
            aria-label="Browser storage"
            className="rounded-2xl bg-muted/50 p-5 text-xs leading-relaxed text-muted-foreground"
          >
            <p className="mb-1 text-sm font-medium text-foreground">
              Your work stays in this browser
            </p>
            <p>
              Applied changes are saved on this device, without account sync.
              Clearing site data removes local projects.
            </p>
            <p>
              Export stories as JSON and export your project’s metadata config
              for backups. Import those files to continue in another browser.
            </p>
          </aside>
        ) : null}
      </div>
    </div>
  );
};

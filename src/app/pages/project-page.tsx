import { Link, useParams } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { NewStoryButton } from "@/features/new-story";
import { FileCard } from "@/features/file-card";
import { FileImportDropzone } from "@/features/file-import";
import { ProjectHeader } from "@/features/project-header";
import { useEditableFiles, useProject, useProjects } from "@/shared/hooks";
import { useJsonDataStore, useNodeStore } from "@/shared/stores";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

const ProjectNotFound = () => (
  <div className="flex min-h-0 flex-1 items-center justify-center p-6 text-left">
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Project not found</CardTitle>
        <CardDescription>
          This project is not available in this browser. Return to projects to
          create one and import your saved files.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link to="/">Back to projects</Link>
        </Button>
      </CardContent>
    </Card>
  </div>
);

export const ProjectPage = () => {
  const { projectId } = useParams({ strict: false }) as { projectId?: string };
  const project = useProject(projectId);
  const projects = useProjects();
  const files = useEditableFiles(projectId);
  const resetJson = useJsonDataStore((state) => state.reset);
  const setSelectedNode = useNodeStore((state) => state.setNode);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resetJson();
    setSelectedNode(null);
  }, [resetJson, setSelectedNode]);

  if (!project) {
    return <ProjectNotFound />;
  }

  return (
    <div
      ref={pageRef}
      data-testid="project-page"
      className="relative flex min-h-0 flex-1 flex-col text-left"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <ProjectHeader
          project={project}
          fileCount={files.length}
          canDelete={projects.length > 1}
        />
        <div className="flex flex-col gap-6 px-6 py-5">
          <FileImportDropzone
            key={project.id}
            projectId={project.id}
            pageDropTargetRef={pageRef}
          />
          <section
            aria-labelledby="files-heading"
            className="flex flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-3">
              <h2
                id="files-heading"
                className="text-sm font-medium text-muted-foreground"
              >
                Files
              </h2>
              <NewStoryButton project={project} />
            </div>
            {files.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {files.map((file) => (
                  <FileCard key={file.id} file={file} projects={projects} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-start gap-1 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">No files yet.</p>
                <p>
                  Create a new story, or drop .twee, .json or .md files here to
                  add them to {project.name}.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

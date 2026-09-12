import { FilePlus } from "lucide-react";
import { useOpenEditableFile } from "@/features/open-editable-file";
import { createStoryNode } from "@/shared/lib/create-story-node";
import { seedMetadataDefaults } from "@/shared/lib/convertors/seed-metadata-defaults";
import { listEditableFilesByProject } from "@/shared/lib/editable-files-storage";
import type { ProjectRecord } from "@/shared/types";
import { Button } from "@/shared/ui/button";

export const NewStoryButton = ({ project }: { project: ProjectRecord }) => {
  const openFile = useOpenEditableFile();
  const createStory = () => {
    const names = new Set(
      listEditableFilesByProject(project.id).map((file) => file.name),
    );
    let name = "Untitled story";
    let suffix = 2;
    while (names.has(name)) name = "Untitled story " + suffix++;
    const start = {
      ...createStoryNode("Start"),
      metadata: seedMetadataDefaults(project.metadataConfig),
    };
    openFile(
      { title: name, start: start.name, nodes: [start] },
      name,
      "json",
      project.id,
    );
  };
  return (
    <Button onClick={createStory}>
      <FilePlus aria-hidden="true" />
      New story
    </Button>
  );
};

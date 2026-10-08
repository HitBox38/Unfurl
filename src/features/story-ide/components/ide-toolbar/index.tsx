import { Code2, Download, ListChecks } from "lucide-react";

import { ProjectMetadataRefactor } from "@/features/project-metadata-refactor";
import { Button } from "@/shared/ui/button";
import { IdeFixStatus } from "@/features/story-ide/components/ide-fix-status";
import type { StoryIdeController } from "@/features/story-ide/hooks/use-story-ide-controller";

export const IdeToolbar = ({ ide }: { ide: StoryIdeController }) => {
  const {
    pending,
    changedNodes,
    projectId,
    valid,
    exportTestCopy,
    discard,
    setError,
    setReviewOpen,
  } = ide;
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <Code2 className="size-4 text-chart-2" />
        <span className="text-sm font-medium">Story IDE</span>
        <IdeFixStatus pending={pending} changedNodes={changedNodes} />
      </div>
      <div className="flex flex-wrap gap-2">
        <ProjectMetadataRefactor projectId={projectId} />
        <Button
          variant="outline"
          size="sm"
          disabled={!valid}
          onClick={exportTestCopy}
        >
          <Download className="size-4" />
          Export test copy
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!pending}
          onClick={discard}
        >
          Discard fix
        </Button>
        <Button
          size="sm"
          disabled={!pending}
          onClick={() => {
            setError(null);
            setReviewOpen(true);
          }}
        >
          <ListChecks className="size-4" />
          Review fix
        </Button>
      </div>
    </div>
  );
};

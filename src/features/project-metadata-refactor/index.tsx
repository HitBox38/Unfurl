import { Braces } from "lucide-react";

import { useMetadataRefactor } from "@/features/project-metadata-refactor/hooks/use-metadata-refactor";
import { DefinitionEditor } from "@/features/project-metadata-refactor/components/definition-editor";
import { RefactorPreview } from "@/features/project-metadata-refactor/components/refactor-preview";
import { RefactorFooter } from "@/features/project-metadata-refactor/components/refactor-footer";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

export const ProjectMetadataRefactor = ({
  projectId,
}: {
  projectId: string | null;
}) => {
  const refactor = useMetadataRefactor(projectId);
  const {
    project,
    open,
    setOpen,
    start,
    error,
    plan,
    visibleChanges,
    setVisibleChanges,
  } = refactor;
  return (
    <>
      <Button variant="outline" size="sm" disabled={!project} onClick={start}>
        <Braces className="size-4" />
        Metadata refactor
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[85svh] flex-col sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Project metadata refactor</DialogTitle>
            <DialogDescription>
              Review definition changes and their effects across every story in{" "}
              {project?.name}. This is separate from your pending story fix.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 space-y-4 overflow-auto text-left">
            {error ? (
              <p
                role="alert"
                className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </p>
            ) : null}
            {plan ? (
              <RefactorPreview
                plan={plan}
                visibleChanges={visibleChanges}
                onShowMore={() => setVisibleChanges(visibleChanges + 100)}
              />
            ) : (
              <DefinitionEditor refactor={refactor} />
            )}
          </div>
          <RefactorFooter refactor={refactor} />
        </DialogContent>
      </Dialog>
    </>
  );
};

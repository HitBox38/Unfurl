import { Sparkles } from "lucide-react";

import { DialogViewer } from "@/features/dialog-viewer";
import { StoryGraphPreview } from "@/features/story-graph-preview";
import { canApplyDraft, parseDocument } from "@/features/story-ide/draft";
import { Button } from "@/shared/ui/button";
import type { FilePageController } from "@/app/pages/file-page/hooks/use-file-page";

export const FileGraphPane = ({ page }: { page: FilePageController }) => {
  const {
    pending,
    workspace,
    draft,
    selectPreview,
    chooseMode,
    showBlankStoryCue,
  } = page;
  return (
    <div className="file-graph-pane relative">
      {pending && workspace ? (
        <>
          <StoryGraphPreview
            story={workspace.lastValid}
            selectedName={
              parseDocument(
                workspace.documents.find(
                  (entry) => entry.id === workspace.activeId,
                ) ?? { id: "", originalName: null, text: "null" },
              ).node?.name
            }
            onSelect={selectPreview}
          />
          <div className="workspace-bubble absolute left-4 right-4 top-4 z-10 flex flex-wrap items-center justify-between gap-3 p-3 text-left text-sm">
            <span>
              {draft && canApplyDraft(draft)
                ? "Pending fix · Read-only graph preview"
                : "Pending fix · Last valid graph preview is out of date"}
            </span>
            <Button size="sm" onClick={() => chooseMode("ide")}>
              Continue in IDE
            </Button>
          </div>
        </>
      ) : (
        <DialogViewer />
      )}
      {showBlankStoryCue && !pending ? (
        <aside
          aria-label="Blank story prompt"
          className="workspace-bubble pointer-events-none absolute bottom-24 left-4 right-4 z-10 max-w-xs p-4 text-left text-sm"
        >
          <p className="flex items-center gap-2 font-medium text-foreground">
            <Sparkles className="size-4 text-primary" />
            Give Start a first line.
          </p>
          <p className="mt-1 text-muted-foreground">
            Then add a choice when the path branches.
          </p>
        </aside>
      ) : null}
    </div>
  );
};

import { Tabs } from "@/shared/ui/tabs";
import { DraftReview } from "@/features/story-ide/components/draft-review";
import { IdeToolbar } from "@/features/story-ide/components/ide-toolbar";
import { IdeMessages } from "@/features/story-ide/components/ide-messages";
import { IdeSidebar } from "@/features/story-ide/components/ide-sidebar";
import { NodeTabs } from "@/features/story-ide/components/node-tabs";
import { IdeEditorPane } from "@/features/story-ide/components/ide-editor-pane";
import { IdeDiagnostics } from "@/features/story-ide/components/ide-diagnostics";
import { useStoryIdeController } from "@/features/story-ide/hooks/use-story-ide-controller";

export const StoryIde = ({ fileId }: { fileId: string }) => {
  const ide = useStoryIdeController(fileId);
  if (!ide)
    return (
      <div className="p-6 text-left text-sm text-muted-foreground">
        Preparing story IDE…
      </div>
    );
  return (
    <section
      className="story-ide workspace-bubble flex h-full min-h-0 min-w-0 flex-col overflow-hidden text-left"
      aria-label="Story IDE"
    >
      <IdeToolbar ide={ide} />
      <IdeMessages ide={ide} />
      <div className="story-ide-body min-h-0 flex-1" data-sidebar={ide.sidebar}>
        <IdeSidebar ide={ide} />
        <Tabs
          value={ide.workspace.activeId ?? ""}
          onValueChange={ide.select}
          className="min-h-0 min-w-0 flex-1 flex-col gap-0"
        >
          <NodeTabs ide={ide} />
          <IdeEditorPane ide={ide} />
          <IdeDiagnostics ide={ide} />
          <div className="flex shrink-0 flex-wrap justify-between gap-2 border-t bg-muted/15 px-3 py-2 text-[11px] text-muted-foreground">
            <span>JSON · Ctrl/⌘ Space for suggestions</span>
            <span>Renames and removals update story links in review.</span>
          </div>
        </Tabs>
      </div>
      <DraftReview
        open={ide.reviewOpen}
        onOpenChange={ide.setReviewOpen}
        saved={ide.saved}
        result={ide.result}
        error={ide.error}
        onApply={ide.apply}
        onResolve={(id, resolution) =>
          ide.actions.resolve(fileId, id, resolution)
        }
      />
    </section>
  );
};
export default StoryIde;

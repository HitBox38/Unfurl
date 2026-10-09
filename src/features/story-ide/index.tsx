import { DraftReview } from "@/features/story-ide/components/draft-review";
import { IdeToolbar } from "@/features/story-ide/components/ide-toolbar";
import { IdeMessages } from "@/features/story-ide/components/ide-messages";
import { IdeWorkspace } from "@/features/story-ide/components/ide-workspace";
import { IdeMotion } from "@/features/story-ide/components/ide-motion";
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
    <IdeMotion>
      <IdeToolbar ide={ide} />
      <IdeMessages ide={ide} />
      <IdeWorkspace ide={ide} />
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
    </IdeMotion>
  );
};
export default StoryIde;

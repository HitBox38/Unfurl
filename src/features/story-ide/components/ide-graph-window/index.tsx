import { StoryGraphPreview } from "@/features/story-graph-preview";
import type { StoryIdeController } from "@/features/story-ide/hooks/use-story-ide-controller";

export const IdeGraphWindow = ({ ide }: { ide: StoryIdeController }) => {
  const {
    previewCurrent,
    workspace,
    activeNode,
    activeDocument,
    selectPreview,
  } = ide;
  return (
    <section
      className="ide-graph-window shrink-0 border-t"
      aria-label="Graph preview window"
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-[11px]">
        <span className="font-medium">Graph preview</span>
        <span
          className={previewCurrent ? "text-muted-foreground" : "text-warning"}
        >
          {previewCurrent ? "Read only" : "Out of date"}
        </span>
      </div>
      <div className="h-44">
        <StoryGraphPreview
          story={workspace.lastValid}
          selectedName={activeNode?.name ?? activeDocument?.originalName}
          compact
          onSelect={selectPreview}
        />
      </div>
    </section>
  );
};

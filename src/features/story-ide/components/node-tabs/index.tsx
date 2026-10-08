import { NodeTab } from "@/features/story-ide/components/node-tab";
import type { StoryIdeController } from "@/features/story-ide/hooks/use-story-ide-controller";

export const NodeTabs = ({ ide }: { ide: StoryIdeController }) => {
  const { workspace } = ide;
  return (
    <div
      role="tablist"
      aria-label="Open node tabs"
      className="flex shrink-0 overflow-x-auto border-b bg-muted/20"
    >
      {workspace.tabs.map((id, index) => (
        <NodeTab key={id} ide={ide} id={id} index={index} />
      ))}
    </div>
  );
};

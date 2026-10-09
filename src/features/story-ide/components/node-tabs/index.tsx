import { useId } from "react";
import { LayoutGroup } from "motion/react";
import * as m from "motion/react-m";

import { TabsList } from "@/shared/ui/tabs";
import { NodeTab } from "@/features/story-ide/components/node-tab";
import type { StoryIdeController } from "@/features/story-ide/hooks/use-story-ide-controller";

export const NodeTabs = ({ ide }: { ide: StoryIdeController }) => {
  const { workspace } = ide;
  const layoutId = useId();
  return (
    <m.div layoutScroll className="shrink-0 overflow-x-auto px-3 py-2">
      <LayoutGroup id={layoutId}>
        <TabsList
          aria-label="Open node tabs"
          className="workspace-bubble h-auto min-h-10 justify-start gap-1 rounded-2xl bg-card/95 p-1 group-data-horizontal/tabs:h-auto"
        >
          {workspace.tabs.map((id) => (
            <NodeTab key={id} ide={ide} id={id} />
          ))}
        </TabsList>
      </LayoutGroup>
    </m.div>
  );
};

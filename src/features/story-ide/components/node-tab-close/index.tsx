import { X } from "lucide-react";
import * as m from "motion/react-m";

import { Button } from "@/shared/ui/button";
import { useIdeMotion } from "@/features/story-ide/hooks/use-ide-motion";
import type { StoryIdeController } from "@/features/story-ide/hooks/use-story-ide-controller";

export const NodeTabClose = ({
  ide,
  id,
  name,
  selected,
}: {
  ide: StoryIdeController;
  id: string;
  name: string;
  selected: boolean;
}) => {
  const { tabTransition } = useIdeMotion();
  return (
    <Button
      asChild
      variant="ghost"
      size="icon-xs"
      className="ide-node-tab-close mr-1 shrink-0 transition-none"
      tabIndex={selected ? 0 : -1}
      aria-label={`Close tab ${name}`}
      onClick={(event) => {
        const list = event.currentTarget.closest('[role="tablist"]');
        const addNode = list
          ?.closest('[aria-label="Story IDE"]')
          ?.querySelector<HTMLButtonElement>('[aria-label="Add draft node"]');
        ide.actions.closeTab(ide.fileId, id);
        requestAnimationFrame(() => {
          const activeTab = list?.querySelector<HTMLButtonElement>(
            '[role="tab"][data-state="active"]',
          );
          (activeTab ?? addNode)?.focus();
        });
      }}
    >
      <m.button layout="position" transition={tabTransition}>
        <X className="size-3" />
      </m.button>
    </Button>
  );
};

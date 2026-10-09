import { useId } from "react";
import { LayoutGroup } from "motion/react";
import * as m from "motion/react-m";

import { Tabs } from "@/shared/ui/tabs";
import { IdeSidebar } from "@/features/story-ide/components/ide-sidebar";
import { NodeTabs } from "@/features/story-ide/components/node-tabs";
import { IdeEditorPane } from "@/features/story-ide/components/ide-editor-pane";
import { IdeDiagnostics } from "@/features/story-ide/components/ide-diagnostics";
import { useIdeMotion } from "@/features/story-ide/hooks/use-ide-motion";
import type { StoryIdeController } from "@/features/story-ide/hooks/use-story-ide-controller";

export const IdeWorkspace = ({ ide }: { ide: StoryIdeController }) => {
  const id = useId();
  const { tabTransition } = useIdeMotion();
  return (
    <LayoutGroup id={id}>
      <div
        className="story-ide-body min-h-0 flex-1"
        data-sidebar={ide.sidebar}
        data-collapsed={ide.sidebarCollapsed}
      >
        <IdeSidebar ide={ide} />
        <m.div
          layout="position"
          transition={tabTransition}
          className="flex min-h-0 min-w-0 flex-col"
        >
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
        </m.div>
      </div>
    </LayoutGroup>
  );
};

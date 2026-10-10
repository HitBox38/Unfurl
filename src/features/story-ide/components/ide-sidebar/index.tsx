import { useId } from "react";
import * as m from "motion/react-m";

import { IdeSidebarControls } from "@/features/story-ide/components/ide-sidebar-controls";
import { IdeGraphWindow } from "@/features/story-ide/components/ide-graph-window";
import { StorySearch } from "@/features/story-ide/components/story-search";
import { NodeExplorer } from "@/features/story-ide/components/node-explorer";
import { stageDocuments } from "@/features/story-ide/draft";
import { useIdeMotion } from "@/features/story-ide/hooks/use-ide-motion";
import type { StoryIdeController } from "@/features/story-ide/hooks/use-story-ide-controller";

export const IdeSidebar = ({ ide }: { ide: StoryIdeController }) => {
  const { sidebar, actions, fileId, workspace, select, setNotice } = ide;
  const contentId = useId();
  const { entrance, transition, reducedMotion, tabTransition } = useIdeMotion();
  return (
    <m.aside
      layout={!reducedMotion}
      transition={tabTransition}
      className="ide-sidebar flex min-h-0 flex-col border-r bg-muted/15"
      aria-label="Story investigation"
    >
      <IdeSidebarControls ide={ide} contentId={contentId} />
      <m.div
        id={contentId}
        layout="position"
        initial={false}
        animate={{ opacity: ide.sidebarCollapsed ? 0 : 1 }}
        transition={{ ...transition, layout: tabTransition }}
        className={ide.sidebarCollapsed ? "hidden" : "flex min-h-0 flex-1 flex-col"}
        aria-hidden={ide.sidebarCollapsed || undefined}
        inert={ide.sidebarCollapsed}
      >
        <m.div
          key={sidebar}
          className="flex min-h-0 flex-1 flex-col"
          initial={entrance}
          animate={{ opacity: 1 }}
          transition={transition}
        >
          {sidebar === "nodes" ? (
            <NodeExplorer ide={ide} />
          ) : (
            <StorySearch
              documents={workspace.documents}
              search={workspace.search}
              onSearch={(search) => actions.setSearch(fileId, search)}
              onSelect={(match) => select(match.documentId, match.path, match.key)}
              onReplace={(documents) => {
                actions.update(
                  fileId,
                  (current) => stageDocuments(current, documents),
                  true,
                );
                setNotice(
                  "Replacements staged. Review the complete fix before applying.",
                );
              }}
            />
          )}
        </m.div>
        <IdeGraphWindow ide={ide} />
      </m.div>
    </m.aside>
  );
};

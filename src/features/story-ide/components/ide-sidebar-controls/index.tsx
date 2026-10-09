import { useId } from "react";
import { LayoutGroup } from "motion/react";
import * as m from "motion/react-m";
import { Files, PanelLeftClose, PanelLeftOpen, Plus, Search } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";
import { useIdeMotion } from "@/features/story-ide/hooks/use-ide-motion";
import type { StoryIdeController } from "@/features/story-ide/hooks/use-story-ide-controller";

export const IdeSidebarControls = ({
  ide,
  contentId,
}: {
  ide: StoryIdeController;
  contentId: string;
}) => {
  const id = useId();
  const { layoutMotion, layoutTransition } = useIdeMotion();
  const { sidebarCollapsed, setSidebarCollapsed } = ide;
  const label = sidebarCollapsed ? "Expand IDE sidebar" : "Collapse IDE sidebar";
  return (
    <m.div
      layout="position"
      transition={{ duration: 0 }}
      className="ide-sidebar-controls flex shrink-0 items-center gap-1 border-b p-2"
    >
      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0"
        aria-label={label}
        title={label}
        aria-expanded={!sidebarCollapsed}
        aria-controls={contentId}
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="size-4" aria-hidden="true" />
        ) : (
          <PanelLeftClose className="size-4" aria-hidden="true" />
        )}
      </Button>
      <LayoutGroup id={id}>
        {([
          { value: "nodes", label: "Nodes", Icon: Files },
          { value: "search", label: "Search", Icon: Search },
        ] as const).map(({ value, label, Icon }) => (
          <Button
            key={value}
            size="sm"
            variant="ghost"
            className={cn("relative isolate", sidebarCollapsed && "hidden")}
            aria-pressed={ide.sidebar === value}
            onClick={() => ide.setSidebar(value)}
          >
            {ide.sidebar === value ? (
              <m.span
                layoutId={layoutMotion ? "sidebar-selection" : undefined}
                className="absolute inset-0 -z-10 rounded-lg bg-secondary"
                transition={layoutTransition}
                aria-hidden="true"
              />
            ) : null}
            <Icon className="size-4" />
            {label}
          </Button>
        ))}
      </LayoutGroup>
      <Button
        variant="ghost"
        size="icon-sm"
        className={sidebarCollapsed ? "hidden" : "ml-auto"}
        aria-label="Add draft node"
        title="Add draft node"
        onClick={() => ide.actions.addNode(ide.fileId)}
      >
        <Plus className="size-4" />
      </Button>
    </m.div>
  );
};

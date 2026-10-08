import * as m from "motion/react-m";

import { cn } from "@/shared/lib/cn";
import { TabsTrigger } from "@/shared/ui/tabs";
import { NodeTabClose } from "@/features/story-ide/components/node-tab-close";
import { valuesEqual } from "@/features/story-ide/merge";
import { useIdeMotion } from "@/features/story-ide/hooks/use-ide-motion";
import { useNodeTabInteraction } from "@/features/story-ide/hooks/use-node-tab-interaction";
import type { StoryIdeController } from "@/features/story-ide/hooks/use-story-ide-controller";

export const NodeTab = ({
  ide,
  id,
}: {
  ide: StoryIdeController;
  id: string;
}) => {
  const { workspace, result } = ide;
  const { reducedMotion, tabTransition } = useIdeMotion();
  const selected = workspace.activeId === id;
  const { expanded, interactionProps } = useNodeTabInteraction(selected);
  const document = workspace.documents.find((entry) => entry.id === id);
  if (!document) return null;
  const node = result.nodesByDocument.get(id);
  const name =
    node?.name ?? document.lastName ?? document.originalName ?? "New node";
  const dirty =
    document.deleted ||
    !valuesEqual(
      node,
      workspace.base.nodes.find(
        (entry) => entry.name === document.originalName,
      ),
    );
  return (
    <m.div
      layout={!reducedMotion}
      transition={tabTransition}
      className="ide-node-tab relative isolate flex shrink-0 items-center rounded-xl pr-1"
      data-selected={selected}
      {...interactionProps}
    >
      {selected ? (
        <m.span
          layoutId={reducedMotion ? undefined : "node-tab-selection"}
          className="pointer-events-none absolute inset-0 -z-10 rounded-xl border border-border/60 bg-secondary"
          transition={tabTransition}
          aria-hidden="true"
        />
      ) : null}
      <TabsTrigger
        asChild
        value={id}
        className="h-8 max-w-52 flex-none justify-start gap-2 rounded-xl bg-transparent px-3 font-mono text-xs transition-colors data-active:bg-transparent data-[state=active]:text-secondary-foreground dark:data-active:border-transparent dark:data-active:bg-transparent group-data-[variant=default]/tabs-list:data-active:shadow-none"
      >
        <m.button layout="position" transition={tabTransition}>
          <span className={cn("truncate", document.deleted && "line-through")}>
            {name}
          </span>
          {dirty ? (
            <span
              className="size-1.5 shrink-0 rounded-full bg-chart-2"
              aria-label="Pending changes"
            />
          ) : null}
        </m.button>
      </TabsTrigger>
      {expanded ? (
        <NodeTabClose ide={ide} id={id} name={name} selected={selected} />
      ) : null}
    </m.div>
  );
};

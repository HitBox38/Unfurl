import { Code2, GitBranch } from "lucide-react";
import * as m from "motion/react-m";

import { useViewMotion } from "@/shared/hooks/use-view-motion";
import { TabsList, TabsTrigger } from "@/shared/ui/tabs";

export const FileViewSwitch = ({ mode }: { mode: "graph" | "ide" }) => {
  const { layout, spring } = useViewMotion();
  return (
    <TabsList
      asChild
      className="workspace-bubble workspace-toolbar h-auto min-h-10 rounded-2xl bg-card/95 group-data-horizontal/tabs:h-auto"
      aria-label="Story view"
    >
      <m.div layout="position" transition={spring}>
        {(["graph", "ide"] as const).map((view) => (
          <TabsTrigger
            key={view}
            value={view}
            className="isolate h-8 flex-none rounded-xl px-3 transition-colors data-active:bg-transparent data-[state=active]:text-secondary-foreground dark:data-active:border-transparent dark:data-active:bg-transparent group-data-[variant=default]/tabs-list:data-active:shadow-none"
          >
            {mode === view ? (
              <m.span
                data-testid="file-view-selection"
                layoutId={layout ? "file-view-selection" : undefined}
                transition={spring}
                className="pointer-events-none absolute inset-0 -z-10 rounded-xl border border-border/60 bg-secondary"
                aria-hidden="true"
              />
            ) : null}
            {view === "graph" ? (
              <GitBranch className="size-4" aria-hidden="true" />
            ) : (
              <Code2 className="size-4" aria-hidden="true" />
            )}
            {view === "graph" ? "Graph" : "IDE"}
          </TabsTrigger>
        ))}
      </m.div>
    </TabsList>
  );
};

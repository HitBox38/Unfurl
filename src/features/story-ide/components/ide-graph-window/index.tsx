import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import * as m from "motion/react-m";

import { StoryGraphPreview } from "@/features/story-graph-preview";
import type { StoryIdeController } from "@/features/story-ide/hooks/use-story-ide-controller";
import { useGraphPreviewHeight } from "@/features/story-ide/hooks/use-graph-preview-height";
import { useIdeMotion } from "@/features/story-ide/hooks/use-ide-motion";
import { Button } from "@/shared/ui/button";

export const IdeGraphWindow = ({ ide }: { ide: StoryIdeController }) => {
  const [expanded, setExpanded] = useState(true);
  const contentId = useId();
  const { contentRef, height } = useGraphPreviewHeight();
  const { transition, reducedMotion } = useIdeMotion();
  const movement = reducedMotion ? { duration: 0 } : transition;
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
      data-collapsed={!expanded}
    >
      <Button
        type="button"
        variant="ghost"
        className="h-auto w-full justify-between gap-2 rounded-none px-3 py-2 text-[11px]"
        aria-label={expanded ? "Collapse graph preview" : "Expand graph preview"}
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="flex items-center gap-1.5 font-medium">
          <m.span
            initial={false}
            animate={{ transform: expanded ? "rotate(0deg)" : "rotate(-90deg)" }}
            transition={movement}
            className="flex"
            aria-hidden="true"
          >
            <ChevronDown className="size-3" aria-hidden="true" />
          </m.span>
          Graph preview
        </span>
        <span
          className={previewCurrent ? "text-muted-foreground" : "text-warning"}
        >
          {previewCurrent ? "Read only" : "Out of date"}
        </span>
      </Button>
      <m.div
        id={contentId}
        initial={false}
        animate={{ height: expanded ? height : 0, opacity: expanded ? 1 : 0 }}
        transition={{ height: movement, opacity: transition }}
        className="overflow-hidden"
        aria-hidden={!expanded || undefined}
        inert={!expanded}
      >
        <div ref={contentRef} className="ide-graph-content h-44">
          <StoryGraphPreview
            story={workspace.lastValid}
            selectedName={
              activeNode?.name ??
              activeDocument?.lastName ??
              activeDocument?.originalName
            }
            compact
            onSelect={selectPreview}
          />
        </div>
      </m.div>
    </section>
  );
};

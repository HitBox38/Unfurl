import { forwardRef } from "react";
import { useIsPresent } from "motion/react";
import * as m from "motion/react-m";

import { GraphNodeToolbar } from "@/features/graph-node-toolbar";
import { useViewMotion } from "@/shared/hooks/use-view-motion";

export const FileGraphControls = forwardRef<HTMLDivElement>(function FileGraphControls(
  _,
  ref,
) {
  const present = useIsPresent();
  const { collapsed, expanded, fade } = useViewMotion();
  return (
    <m.div
      ref={ref}
      data-testid="file-add-node-bubble"
      className="workspace-bubble workspace-toolbar"
      initial={collapsed}
      animate={expanded}
      exit={collapsed}
      transition={fade}
      inert={!present}
      aria-hidden={!present || undefined}
      style={{ borderRadius: 16 }}
    >
      <GraphNodeToolbar />
    </m.div>
  );
});

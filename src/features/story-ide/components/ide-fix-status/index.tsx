import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";

import { Badge } from "@/shared/ui/badge";
import { useIdeMotion } from "@/features/story-ide/hooks/use-ide-motion";

export const IdeFixStatus = ({
  pending,
  changedNodes,
}: {
  pending: boolean;
  changedNodes: number;
}) => {
  const { entrance, transition } = useIdeMotion();
  return (
    <Badge variant="secondary" className="transition-none">
      <AnimatePresence initial={false}>
        <m.span
          key={String(pending)}
          initial={entrance}
          animate={{ opacity: 1 }}
          transition={transition}
        >
          {pending ? `${changedNodes} nodes in pending fix` : "Saved story"}
        </m.span>
      </AnimatePresence>
    </Badge>
  );
};

import type { ReactNode } from "react";
import { useIsPresent } from "motion/react";
import * as m from "motion/react-m";

import { cn } from "@/shared/lib/cn";
import { useIdeMotion } from "@/features/story-ide/hooks/use-ide-motion";

export const IdeMessage = ({
  children,
  role,
}: {
  children: ReactNode;
  role: "alert" | "status";
}) => {
  const present = useIsPresent();
  const { entrance, transition } = useIdeMotion();
  return (
    <m.p
      role={present ? role : undefined}
      aria-hidden={!present || undefined}
      inert={!present}
      className={cn(
        "shrink-0 border-b px-4 py-2",
        role === "alert"
          ? "bg-destructive/10 text-sm text-destructive"
          : "flex items-center justify-between gap-2 bg-muted/50 text-xs text-muted-foreground",
      )}
      initial={entrance}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      {children}
    </m.p>
  );
};

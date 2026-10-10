import { useState } from "react";

import { useViewMotion } from "@/shared/hooks/use-view-motion";

export const useIdeVisibility = (active: boolean) => {
  const { pointerMotion, fade } = useViewMotion();
  const [previousActive, setPreviousActive] = useState(active);
  const [exiting, setExiting] = useState(false);
  if (previousActive !== active) {
    setPreviousActive(active);
    setExiting(!active && pointerMotion);
  }
  return {
    visible: active || exiting,
    animationProps: {
      initial: false as const,
      animate: { opacity: active ? 1 : 0 },
      transition: fade,
      onAnimationComplete: () => {
        if (!active) setExiting(false);
      },
    },
  };
};

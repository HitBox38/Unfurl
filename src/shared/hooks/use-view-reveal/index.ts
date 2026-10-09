import { useEffectEvent, useLayoutEffect } from "react";
import { useAnimationControls } from "motion/react";

import { useViewMotion } from "@/shared/hooks/use-view-motion";

export const useViewReveal = () => {
  const controls = useAnimationControls();
  const { collapsed, expanded, fade, pointerMotion } = useViewMotion();
  const reveal = useEffectEvent(() => {
    if (pointerMotion) controls.set(collapsed);
    void controls.start({ ...expanded, transition: fade });
  });
  // Activity reconnects effects whenever this view becomes visible again.
  useLayoutEffect(() => {
    reveal();
    return () => controls.stop();
  }, [controls]);
  return controls;
};

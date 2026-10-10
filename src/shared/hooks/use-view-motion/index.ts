import { createContext, useContext } from "react";
import { useReducedMotion } from "motion/react";

import {
  bubbleEaseOut,
  bubbleFadeDuration,
  bubbleSpring,
} from "@/shared/lib/bubble-motion";

export const ViewPointerMotionContext = createContext(false);

export const useViewMotion = () => {
  const pointerMotion = useContext(ViewPointerMotionContext);
  const reducedMotion = useReducedMotion();
  return {
    pointerMotion,
    layout: !reducedMotion,
    spring: pointerMotion && !reducedMotion ? bubbleSpring : { duration: 0 },
    fade: {
      duration: pointerMotion ? bubbleFadeDuration : 0,
      ease: bubbleEaseOut,
    },
    collapsed: {
      opacity: 0,
      transform: reducedMotion ? "none" : "scale(0.95)",
    },
    expanded: {
      opacity: 1,
      transform: reducedMotion ? "none" : "scale(1)",
    },
  };
};

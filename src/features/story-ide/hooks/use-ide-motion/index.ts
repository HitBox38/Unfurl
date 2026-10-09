import { createContext, useContext } from "react";
import { useReducedMotion } from "motion/react";

import {
  bubbleEaseInOut,
  bubbleEaseOut,
  bubbleFadeDuration,
  bubbleSpring,
} from "@/shared/lib/bubble-motion";

export const IdePointerMotionContext = createContext(false);

export const useIdeMotion = () => {
  const pointerMotion = useContext(IdePointerMotionContext);
  const reducedMotion = useReducedMotion();
  const duration = pointerMotion ? bubbleFadeDuration : 0;
  return {
    reducedMotion,
    entrance: pointerMotion ? { opacity: 0 } : (false as const),
    layoutMotion: pointerMotion && !reducedMotion,
    transition: { duration, ease: bubbleEaseOut },
    layoutTransition: {
      duration: reducedMotion ? 0 : duration,
      ease: bubbleEaseInOut,
    },
    tabTransition:
      pointerMotion && !reducedMotion ? bubbleSpring : { duration: 0 },
  };
};

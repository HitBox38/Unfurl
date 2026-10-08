import { createContext, useContext } from "react";
import { useReducedMotion } from "motion/react";

import {
  ideEaseInOut,
  ideEaseOut,
  ideMotionDuration,
  ideTabSpring,
} from "@/features/story-ide/hooks/use-ide-motion/constants";

export const IdePointerMotionContext = createContext(false);

export const useIdeMotion = () => {
  const pointerMotion = useContext(IdePointerMotionContext);
  const reducedMotion = useReducedMotion();
  const duration = pointerMotion ? ideMotionDuration : 0;
  return {
    reducedMotion,
    entrance: pointerMotion ? { opacity: 0 } : (false as const),
    layoutMotion: pointerMotion && !reducedMotion,
    transition: { duration, ease: ideEaseOut },
    layoutTransition: {
      duration: reducedMotion ? 0 : duration,
      ease: ideEaseInOut,
    },
    tabTransition:
      pointerMotion && !reducedMotion ? ideTabSpring : { duration: 0 },
  };
};

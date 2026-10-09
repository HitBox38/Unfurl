import { useState, type ReactNode } from "react";
import { domMax, LazyMotion, MotionConfig } from "motion/react";

import { IdePointerMotionContext } from "@/features/story-ide/hooks/use-ide-motion";

export const IdeMotion = ({ children }: { children: ReactNode }) => {
  const [pointerMotion, setPointerMotion] = useState(false);
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <IdePointerMotionContext value={pointerMotion}>
          <section
            className="story-ide workspace-bubble flex h-full min-h-0 min-w-0 flex-col overflow-hidden text-left"
            aria-label="Story IDE"
            onPointerDownCapture={() => setPointerMotion(true)}
            onPointerMoveCapture={() => setPointerMotion(true)}
            onKeyDownCapture={() => setPointerMotion(false)}
          >
            {children}
          </section>
        </IdePointerMotionContext>
      </MotionConfig>
    </LazyMotion>
  );
};

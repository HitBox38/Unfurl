import { useState, type ComponentProps } from "react";
import { domMax, LazyMotion, MotionConfig } from "motion/react";

import { ViewPointerMotionContext } from "@/shared/hooks/use-view-motion";

export const FileMotion = ({ children, ...props }: ComponentProps<"section">) => {
  const [pointerMotion, setPointerMotion] = useState(false);
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <ViewPointerMotionContext value={pointerMotion}>
          <section
            {...props}
            onPointerDownCapture={(event) => {
              setPointerMotion(true);
              props.onPointerDownCapture?.(event);
            }}
            onKeyDownCapture={(event) => {
              setPointerMotion(false);
              props.onKeyDownCapture?.(event);
            }}
          >
            {children}
          </section>
        </ViewPointerMotionContext>
      </MotionConfig>
    </LazyMotion>
  );
};

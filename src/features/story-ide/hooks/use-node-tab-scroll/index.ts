import { useEffectEvent, useLayoutEffect, useRef } from "react";
import { animate } from "motion";

import { useIdeMotion } from "@/features/story-ide/hooks/use-ide-motion";

export const useNodeTabScroll = (activeId: string | null, tabs: string[]) => {
  const ref = useRef<HTMLDivElement>(null);
  const { layoutTransition } = useIdeMotion();
  const scroll = useEffectEvent((container: HTMLDivElement, left: number) => {
    if (layoutTransition.duration === 0) {
      container.scrollLeft = left;
      return;
    }
    return animate(container.scrollLeft, left, {
      ...layoutTransition,
      onUpdate: (value) => {
        container.scrollLeft = value;
      },
    });
  });

  useLayoutEffect(() => {
    const container = ref.current;
    const selected = container?.querySelector<HTMLElement>(
      '.ide-node-tab[data-selected="true"]',
    );
    const list = selected?.parentElement;
    if (!container || !selected || !list) return;

    let animation: ReturnType<typeof scroll> | undefined;
    const stop = () => animation?.stop();
    const reveal = () => {
      stop();
      const styles = getComputedStyle(container);
      const paddingLeft = parseFloat(styles.paddingLeft) || 0;
      const paddingRight = parseFloat(styles.paddingRight) || 0;
      // Layout offsets ignore the transforms used to animate neighboring tabs.
      const tabLeft = list.offsetLeft + selected.offsetLeft;
      const left = tabLeft - paddingLeft;
      const right = tabLeft + selected.offsetWidth + paddingRight;
      const current = container.scrollLeft;
      const target =
        left < current
          ? left
          : right > current + container.clientWidth
            ? Math.min(left, right - container.clientWidth)
            : current;
      const clamped = Math.max(
        0,
        Math.min(target, container.scrollWidth - container.clientWidth),
      );
      if (Math.abs(clamped - current) < 1) return;
      animation = scroll(container, clamped);
    };

    reveal();
    const observer = new ResizeObserver(reveal);
    observer.observe(container);
    observer.observe(list);
    container.addEventListener("wheel", stop, { passive: true });
    container.addEventListener("pointerdown", stop, { passive: true });
    return () => {
      stop();
      observer.disconnect();
      container.removeEventListener("wheel", stop);
      container.removeEventListener("pointerdown", stop);
    };
  }, [activeId, tabs]);

  return ref;
};

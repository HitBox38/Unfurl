import { useState, type FocusEvent, type PointerEvent } from "react";

export const useNodeTabInteraction = (selected: boolean) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  return {
    expanded: selected || hovered || focused,
    interactionProps: {
      onPointerEnter: (event: PointerEvent<HTMLDivElement>) => {
        if (
          event.pointerType !== "touch" &&
          window.matchMedia("(hover: hover) and (pointer: fine)").matches
        ) {
          setHovered(true);
        }
      },
      onPointerLeave: () => setHovered(false),
      onFocusCapture: () => setFocused(true),
      onBlurCapture: (event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false);
        }
      },
    },
  };
};

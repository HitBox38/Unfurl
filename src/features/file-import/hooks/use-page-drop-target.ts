import { useEffect, useState, type RefObject } from "react";

interface UsePageDropTargetOptions {
  targetRef?: RefObject<HTMLElement | null>;
  /** Drops landing inside this element are handled by it, not here. */
  ignoreWithin: RefObject<HTMLElement | null>;
  onDrop: (files: File[]) => void;
}

/**
 * Turns a large element into a file drop target using native listeners
 * (React's synthetic events would need handlers threaded through the page).
 * Tracks enter/leave depth so moving across child elements does not flicker.
 * Returns the target element while files are dragged over it, else `null`.
 */
export const usePageDropTarget = ({
  targetRef,
  ignoreWithin,
  onDrop,
}: UsePageDropTargetOptions): HTMLElement | null => {
  const [activeTarget, setActiveTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const target = targetRef?.current;
    if (!target) return;
    let depth = 0;

    const reset = () => {
      depth = 0;
      setActiveTarget(null);
    };
    const onDragEnter = (event: DragEvent) => {
      event.preventDefault();
      depth += 1;
      setActiveTarget(target);
    };
    const onDragOver = (event: DragEvent) => {
      event.preventDefault();
    };
    const onDragLeave = () => {
      depth = Math.max(0, depth - 1);
      if (depth === 0) setActiveTarget(null);
    };
    const onDropEvent = (event: DragEvent) => {
      reset();
      if (ignoreWithin.current?.contains(event.target as Node)) return;
      event.preventDefault();
      onDrop(Array.from(event.dataTransfer?.files ?? []));
    };

    target.addEventListener("dragenter", onDragEnter);
    target.addEventListener("dragover", onDragOver);
    target.addEventListener("dragleave", onDragLeave);
    target.addEventListener("drop", onDropEvent);
    window.addEventListener("dragend", reset);
    return () => {
      target.removeEventListener("dragenter", onDragEnter);
      target.removeEventListener("dragover", onDragOver);
      target.removeEventListener("dragleave", onDragLeave);
      target.removeEventListener("drop", onDropEvent);
      window.removeEventListener("dragend", reset);
    };
  }, [ignoreWithin, onDrop, targetRef]);

  return activeTarget;
};

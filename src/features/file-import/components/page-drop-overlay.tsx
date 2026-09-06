import { Upload } from "lucide-react";
import { createPortal } from "react-dom";

interface PageDropOverlayProps {
  container: HTMLElement;
  label: string;
}

/** Full-bleed highlight rendered into the page while files hover over it. */
export const PageDropOverlay = ({ container, label }: PageDropOverlayProps) =>
  createPortal(
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-primary/10 ring-4 ring-inset ring-primary"
    >
      <p className="flex items-center gap-2 rounded-xl bg-card px-4 py-2 font-medium shadow-lg ring-1 ring-foreground/10">
        <Upload className="size-4 text-primary" />
        {label}
      </p>
    </div>,
    container,
  );

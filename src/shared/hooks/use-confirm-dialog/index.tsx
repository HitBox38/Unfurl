import { useCallback } from "react";

import { useDialogStore } from "@/shared/stores";

export interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
}

/**
 * Opens the app-wide dialog as a destructive confirmation. Returns a function
 * so callers can trigger it from event handlers without owning dialog state.
 */
export const useConfirmDialog = () => {
  const setContent = useDialogStore((state) => state.setContent);

  return useCallback(
    ({ title, description, confirmLabel, onConfirm }: ConfirmDialogOptions) =>
      setContent({
        isOpen: true,
        title,
        content: (
          <p className="text-left text-sm text-muted-foreground">{description}</p>
        ),
        functions: [
          {
            name: "Cancel",
            variant: "secondary",
            action: () => {
              /* closing is handled by the dialog host */
            },
          },
          {
            name: confirmLabel,
            variant: "destructive",
            action: onConfirm,
          },
        ],
      }),
    [setContent],
  );
};

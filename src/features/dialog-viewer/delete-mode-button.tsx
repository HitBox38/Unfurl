import { Trash2 } from "lucide-react";

import { useDialogViewerUiStore } from "@/features/dialog-viewer/dialog-viewer-ui-store";
import { Button } from "@/shared/ui/button";

export const DeleteModeButton = () => {
  const isDeleteMode = useDialogViewerUiStore((state) => state.isDeleteMode);
  const toggleDeleteMode = useDialogViewerUiStore(
    (state) => state.toggleDeleteMode,
  );

  return (
    <Button
      type="button"
      variant={isDeleteMode ? "destructive" : "secondary"}
      size="icon-sm"
      aria-label="Delete nodes"
      aria-pressed={isDeleteMode}
      onClick={toggleDeleteMode}
    >
      <Trash2 aria-hidden="true" />
    </Button>
  );
};

import { Trash2 } from "lucide-react";

import { useDialogViewerUiStore } from "@/features/dialog-viewer/hooks/use-dialog-viewer-ui-store";
import { Button } from "@/shared/ui/button";

export const DeleteModeButton = () => {
  const isDeleteMode = useDialogViewerUiStore((state) => state.isDeleteMode);
  const toggleDeleteMode = useDialogViewerUiStore(
    (state) => state.toggleDeleteMode,
  );

  return (
    <Button
      type="button"
      variant={isDeleteMode ? "destructive" : "ghost"}
      size="icon"
      aria-label="Delete nodes"
      title={isDeleteMode ? "Exit delete mode" : "Delete nodes"}
      aria-pressed={isDeleteMode}
      onClick={toggleDeleteMode}
    >
      <Trash2 aria-hidden="true" />
    </Button>
  );
};

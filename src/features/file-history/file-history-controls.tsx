import { useHotkey } from "@tanstack/react-hotkeys";
import { Redo2, Undo2 } from "lucide-react";

import { useJsonDataStore } from "@/shared/stores";
import { Button } from "@/shared/ui/button";

const hotkeyOptions = {
  conflictBehavior: "replace" as const,
  ignoreInputs: true,
  preventDefault: true,
  requireReset: true,
  stopPropagation: true,
};

export const FileHistoryControls = () => {
  const { canUndo, canRedo, undo, redo } = useJsonDataStore();

  useHotkey("Mod+Z", undo, {
    ...hotkeyOptions,
    enabled: canUndo,
    meta: {
      name: "Undo edit",
      description: "Move back in the file edit history",
    },
  });
  useHotkey("Mod+Shift+Z", redo, {
    ...hotkeyOptions,
    enabled: canRedo,
    meta: {
      name: "Redo edit",
      description: "Move forward in the file edit history",
    },
  });

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        aria-label="Undo edit"
        disabled={!canUndo}
        onClick={undo}
      >
        <Undo2 aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        aria-label="Redo edit"
        disabled={!canRedo}
        onClick={redo}
      >
        <Redo2 aria-hidden="true" />
      </Button>
    </div>
  );
};

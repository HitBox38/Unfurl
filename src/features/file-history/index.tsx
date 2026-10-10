import { useHotkey } from "@tanstack/react-hotkeys";
import { Redo2, Undo2 } from "lucide-react";

import { useJsonDataStore } from "@/shared/stores";
import { Button } from "@/shared/ui/button";

import { hotkeyOptions } from "./constants";

export const FileHistoryControls = ({ disabled = false }: { disabled?: boolean }) => {
  const { canUndo, canRedo, undo, redo } = useJsonDataStore();

  useHotkey("Mod+Z", undo, {
    ...hotkeyOptions,
    enabled: canUndo && !disabled,
    meta: {
      name: "Undo edit",
      description: "Move back in the file edit history",
    },
  });
  useHotkey("Mod+Shift+Z", redo, {
    ...hotkeyOptions,
    enabled: canRedo && !disabled,
    meta: {
      name: "Redo edit",
      description: "Move forward in the file edit history",
    },
  });

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Undo edit"
        title="Undo edit"
        disabled={!canUndo || disabled}
        onClick={undo}
      >
        <Undo2 aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Redo edit"
        title="Redo edit"
        disabled={!canRedo || disabled}
        onClick={redo}
      >
        <Redo2 aria-hidden="true" />
      </Button>
    </div>
  );
};

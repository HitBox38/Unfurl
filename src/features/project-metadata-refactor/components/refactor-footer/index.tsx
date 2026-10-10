import { Undo2 } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { DialogFooter } from "@/shared/ui/dialog";
import type { MetadataRefactorController } from "@/features/project-metadata-refactor/hooks/use-metadata-refactor";

export const RefactorFooter = ({
  refactor,
}: {
  refactor: MetadataRefactorController;
}) => {
  const { canUndo, undo, plan, setPlan, setOpen, changed, apply, preview } =
    refactor;
  return (
    <DialogFooter className="shrink-0 border-t pt-4">
      {canUndo ? (
        <Button variant="outline" onClick={undo}>
          <Undo2 className="size-4" />
          Undo last refactor
        </Button>
      ) : null}
      <Button
        variant="secondary"
        onClick={() => (plan ? setPlan(null) : setOpen(false))}
      >
        {plan ? "Edit definitions" : "Cancel"}
      </Button>
      {plan ? (
        <Button disabled={plan.errors.length > 0 || !changed} onClick={apply}>
          Apply project refactor
        </Button>
      ) : (
        <Button onClick={preview}>Review project changes</Button>
      )}
    </DialogFooter>
  );
};

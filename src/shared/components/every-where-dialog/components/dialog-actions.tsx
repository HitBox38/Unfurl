import type { DialogAction } from "@/shared/stores";
import { Button } from "@/shared/ui/button";
import { DialogFooter } from "@/shared/ui/dialog";
import { cn } from "@/shared/lib/cn";

interface Props {
  actions: DialogAction[];
  formName?: string;
  className?: string;
  onClose: () => void;
}

export const DialogActions = ({
  actions,
  formName,
  className,
  onClose,
}: Props) => {
  if (actions.length === 0) {
    return null;
  }

  return (
    <DialogFooter
      className={cn(
        "border-t border-border/40 bg-background/60 px-6 py-4",
        className,
      )}
    >
      {actions.map(
        (
          {
            name,
            action,
            isSubmit,
            disabled = false,
            variant,
            className: actionClassName,
            closeAfterwards = true,
          },
          index,
        ) => (
          <Button
            key={`${name}-${index}`}
            form={formName}
            disabled={disabled}
            type={isSubmit ? "submit" : "button"}
            variant={variant ?? "default"}
            className={actionClassName}
            onClick={(e) => {
              if (!isSubmit) {
                e.preventDefault();
                action(e);
              }
              if (closeAfterwards) {
                onClose();
              }
            }}
          >
            {name}
          </Button>
        ),
      )}
    </DialogFooter>
  );
};

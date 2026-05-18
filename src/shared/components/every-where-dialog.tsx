import { FormProvider, useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { useDialogStore } from "@/shared/stores";
import { cn } from "@/shared/lib/cn";

export const EveryWhereDialog = () => {
  const {
    content,
    isOpen,
    setOpen,
    submitFunction,
    title,
    formName,
    functions,
    isForm,
    classNames,
  } = useDialogStore((state) => state);

  const methods = useForm();

  const renderActions = () =>
    functions && functions.length > 0 ? (
      <DialogFooter className={classNames?.dialogActions}>
        {functions.map(
          (
            {
              name,
              action,
              isSubmit,
              disabled = false,
              variant,
              className,
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
              className={className}
              onClick={(e) => {
                if (!isSubmit) {
                  e.preventDefault();
                  action(e);
                }
                if (closeAfterwards) {
                  setOpen(false);
                }
              }}
            >
              {name}
            </Button>
          ),
        )}
      </DialogFooter>
    ) : null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => setOpen(open)}
    >
      <DialogContent
        className={cn(
          "max-w-2xl gap-0 overflow-hidden p-0",
          classNames?.dialog,
        )}
      >
        {isForm ? (
          <FormProvider {...methods}>
            <form
              id={formName}
              onSubmit={
                submitFunction
                  ? methods.handleSubmit((data) => {
                      submitFunction(data);
                      setOpen(false);
                    })
                  : undefined
              }
              className="flex flex-col"
            >
              {title ? (
                <DialogHeader className={cn("p-6 pb-2", classNames?.dialogTitle)}>
                  <DialogTitle>{title}</DialogTitle>
                  <DialogDescription className="sr-only">
                    {title}
                  </DialogDescription>
                </DialogHeader>
              ) : null}
              <div
                className={cn(
                  "max-h-[70vh] overflow-y-auto px-6 pb-4",
                  classNames?.dialogContent,
                )}
              >
                {content}
              </div>
              {renderActions()}
            </form>
          </FormProvider>
        ) : (
          <>
            {title ? (
              <DialogHeader className={cn("p-6 pb-2", classNames?.dialogTitle)}>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription className="sr-only">
                  {title}
                </DialogDescription>
              </DialogHeader>
            ) : null}
            <div
              className={cn(
                "max-h-[70vh] overflow-y-auto px-6 pb-4",
                classNames?.dialogContent,
              )}
            >
              {content}
            </div>
            {renderActions()}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

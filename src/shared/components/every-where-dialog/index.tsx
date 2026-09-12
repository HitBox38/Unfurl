import { FormProvider, useForm } from "react-hook-form";

import { useDialogStore } from "@/shared/stores";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { cn } from "@/shared/lib/cn";

import { DialogActions } from "./components/dialog-actions";

export const EveryWhereDialog = () => {
  const {
    content,
    isOpen,
    setOpen,
    submitFunction,
    title,
    description,
    formName,
    functions,
    isForm,
    classNames,
  } = useDialogStore((state) => state);

  const methods = useForm();
  const actions = functions ?? [];
  const closeDialog = () => setOpen(false);

  const body = (
    <>
      {title ? (
        <DialogHeader
          className={cn("shrink-0 p-6 pb-2", classNames?.dialogTitle)}
        >
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription
            className={
              description ? "text-sm text-muted-foreground" : "sr-only"
            }
          >
            {description ?? title}
          </DialogDescription>
        </DialogHeader>
      ) : null}
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto px-6 pb-4",
          classNames?.dialogContent,
        )}
      >
        {content}
      </div>
      <DialogActions
        actions={actions}
        formName={formName}
        className={classNames?.dialogActions}
        onClose={closeDialog}
      />
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setOpen(open)}>
      <DialogContent
        className={cn(
          "flex max-h-[calc(100dvh-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0",
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
                      closeDialog();
                    })
                  : undefined
              }
              className="flex min-h-0 flex-1 flex-col"
            >
              {body}
            </form>
          </FormProvider>
        ) : (
          body
        )}
      </DialogContent>
    </Dialog>
  );
};

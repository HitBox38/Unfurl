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
        <DialogHeader className={cn("p-6 pb-2", classNames?.dialogTitle)}>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
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
                      closeDialog();
                    })
                  : undefined
              }
              className="flex flex-col"
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

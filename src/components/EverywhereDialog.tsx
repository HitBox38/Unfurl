import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useDialogStore } from "../stores/DialogStore";
import { useForm, FormProvider } from "react-hook-form";

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

  return (
    <Dialog open={isOpen} onClose={() => setOpen()} maxWidth="lg" className={classNames?.dialog}>
      {isForm ? (
        <FormProvider {...methods}>
          <Box
            id={formName}
            component={"form"}
            onSubmit={submitFunction && methods.handleSubmit(submitFunction)}>
            {title && <DialogTitle className={classNames?.dialogTitle}>{title}</DialogTitle>}
            <DialogContent className={classNames?.dialogContent}>{content}</DialogContent>
            {functions && functions?.length > 0 && (
              <DialogActions className={classNames?.dialogActions}>
                {functions.map(
                  (
                    {
                      name,
                      action,
                      isSubmit,
                      disabled = false,
                      className,
                      closeAfterwards = true,
                      ...rest
                    },
                    index
                  ) => (
                    <Button
                      {...rest}
                      variant="contained"
                      form={formName}
                      disabled={disabled}
                      type={isSubmit ? "submit" : "button"}
                      className={className}
                      onClick={(e) => {
                        !isSubmit && e.preventDefault();
                        !isSubmit && action(e);
                        closeAfterwards && setOpen();
                      }}
                      key={index}>
                      {name}
                    </Button>
                  )
                )}
              </DialogActions>
            )}
          </Box>
        </FormProvider>
      ) : (
        <>
          {title && <DialogTitle className={classNames?.dialogTitle}>{title}</DialogTitle>}
          <DialogContent className={classNames?.dialogContent}>{content}</DialogContent>
          {functions && functions?.length > 0 && (
            <DialogActions className={classNames?.dialogActions}>
              {functions.map(
                (
                  { name, action, disabled = false, className, closeAfterwards = true, ...rest },
                  index
                ) => (
                  <Button
                    {...rest}
                    variant="contained"
                    form={formName}
                    disabled={disabled}
                    type={"button"}
                    className={className}
                    onClick={(e) => {
                      e.preventDefault();
                      action(e);
                      closeAfterwards && setOpen();
                    }}
                    key={index}>
                    {name}
                  </Button>
                )
              )}
            </DialogActions>
          )}
        </>
      )}
    </Dialog>
  );
};

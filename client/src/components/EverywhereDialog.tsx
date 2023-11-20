import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useDialogStore } from "../stores/DialogStore";
import { useForm, FormProvider } from "react-hook-form";
import { MetadataConfigTemplate } from "../interfaces/MetadataConfigTemplate";

export const EveryWhereDialog = () => {
  const { content, isOpen, setOpen, submitFunction, title, formName, functions, isForm, style } =
    useDialogStore((state) => state);

  const methods = useForm<MetadataConfigTemplate>();

  return (
    <Dialog open={isOpen} onClose={() => setOpen()} maxWidth="lg">
      {isForm ? (
        <FormProvider {...methods}>
          <Box
            id={formName}
            component={"form"}
            onSubmit={submitFunction && methods.handleSubmit(submitFunction)}
            sx={{ width: "1000px" }}>
            {title && <DialogTitle sx={style?.dialogTitle}>{title}</DialogTitle>}
            <DialogContent sx={style?.dialogContent}>{content}</DialogContent>
            {functions && functions?.length > 0 && (
              <DialogActions sx={style?.dialogActions}>
                {functions.map(({ name, action, isSubmit, disabled }, index) => (
                  <Button
                    variant="contained"
                    form={formName}
                    disabled={disabled}
                    type={isSubmit ? "submit" : "button"}
                    onClick={(e) => {
                      !isSubmit && e.preventDefault();
                      !isSubmit && action(e);
                      setOpen();
                    }}
                    key={index}>
                    {name}
                  </Button>
                ))}
              </DialogActions>
            )}
          </Box>
        </FormProvider>
      ) : (
        <>
          {title && <DialogTitle>{title}</DialogTitle>}
          <DialogContent>{content}</DialogContent>
          {functions && functions?.length > 0 && (
            <DialogActions>
              {functions.map(({ name, action, disabled }, index) => (
                <Button
                  variant="contained"
                  form={formName}
                  disabled={disabled}
                  type={"button"}
                  onClick={(e) => {
                    e.preventDefault();
                    action(e);
                    setOpen();
                  }}
                  key={index}>
                  {name}
                </Button>
              ))}
            </DialogActions>
          )}
        </>
      )}
    </Dialog>
  );
};

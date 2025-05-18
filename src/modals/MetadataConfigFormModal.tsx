import { SubmitHandler } from "react-hook-form";
import { MetadataConfigForm } from "../components/MetadataConfigForm";
import { MetadataConfigTemplate } from "../interfaces/MetadataConfigTemplate";
import { useStorage } from "../hooks/useStorage";
import { DialogStore, useDialogStore } from "../stores/DialogStore";
import { tss } from "tss-react/mui";

export const useMetadataConfigFormModal = (): Omit<DialogStore, "setOpen" | "setContent"> => {
  const { isOpen } = useDialogStore((state) => state);
  const [config, setConfig] = useStorage<MetadataConfigTemplate>({
    key: "metadataConfig",
    defaultValue: {
      config: [],
    },
  });
  const { classes } = useStyles();

  const submitConfig: SubmitHandler<MetadataConfigTemplate> = (data) => setConfig(data);

  return {
    content: <MetadataConfigForm />,
    isOpen: !isOpen,
    title: "Metadata Configuration",
    isForm: true,
    formName: "metadata-config",
    functions: [
      {
        isSubmit: true,
        name: "Save",
        color: "primary",
        action: () => {},
      },
      config.config.length > 0
        ? {
            name: "Export Config",
            color: "info",
            action: () => {
              const element = document.createElement("a");
              const file = new Blob([JSON.stringify(config)], { type: "application/json" });
              element.href = URL.createObjectURL(file);
              element.download = "metadataConfig.json";
              element.click();
              element.remove();
            },
          }
        : {
            name: "Import Config",
            disabled: config.config.length > 0,
            color: "info",
            closeAfterwards: false,
            action: () => {
              const element = document.createElement("input");
              element.type = "file";
              element.accept = ".json";
              element.onchange = () => {
                const file = element.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const data = JSON.parse(reader.result as string);
                    if (!data.config) {
                      alert("Invalid JSON file");
                      return;
                    }
                    setConfig(data);
                  };
                  reader.readAsText(file);
                }
              };
              element.click();
              element.remove();
            },
          },
    ],
    submitFunction: (data) => submitConfig(data as MetadataConfigTemplate),
    classNames: {
      dialog: classes.dialog,
      dialogContent: classes.dialogContent,
    },
  };
};

const useStyles = tss.create(() => ({
  dialog: {
    "& .MuiDialog-paper": {
      overflowY: "hidden",
    },
  },
  dialogContent: {
    maxHeight: "70vh",
  },
}));

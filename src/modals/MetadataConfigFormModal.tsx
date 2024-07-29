import { SubmitHandler } from "react-hook-form";
import { MetadataConfigForm } from "../components/MetadataConfigForm";
import { MetadataConfigTemplate } from "../interfaces/MetadataConfigTemplate";
import useLocalStorage from "../hooks/useLocalStorage";
import { DialogStore, useDialogStore } from "../stores/DialogStore";

export const useMetadataConfigFormModal = (): Omit<DialogStore, "setOpen" | "setContent"> => {
  const { isOpen } = useDialogStore((state) => state);
  const [, setConfig] = useLocalStorage<MetadataConfigTemplate>("metadataConfig", {
    config: [],
  });

  const submitConfig: SubmitHandler<MetadataConfigTemplate> = (data) => setConfig(data);

  return {
    content: <MetadataConfigForm />,
    isOpen: !isOpen,
    title: "Metadata Configuration",
    isForm: true,
    formName: "metadata-config",
    functions: [
      {
        disabled: false,
        isSubmit: true,
        name: "Save",
        action: () => console.log("pressed"),
      },
    ],
    submitFunction: submitConfig,
    style: {
      dialog: {
        ["& .MuiDialog-paper"]: {
          overflowY: "hidden",
        },
      },
      dialogContent: {
        overflowY: "scroll",
        maxHeight: "70vh",
      },
    },
  };
};

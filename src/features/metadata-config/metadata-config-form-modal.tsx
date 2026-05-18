import type { SubmitHandler } from "react-hook-form";

import { useStorage } from "@/shared/hooks";
import {
  useDialogStore,
  type DialogContent as DialogContentValue,
} from "@/shared/stores";
import type { MetadataConfigTemplate } from "@/shared/types";

import { MetadataConfigForm } from "@/features/metadata-config/metadata-config-form";

export const useMetadataConfigFormModal = (): DialogContentValue => {
  const isOpen = useDialogStore((state) => state.isOpen);
  const [config, setConfig] = useStorage<MetadataConfigTemplate>({
    key: "metadataConfig",
    defaultValue: { config: [] },
  });

  const submitConfig: SubmitHandler<MetadataConfigTemplate> = (data) =>
    setConfig(data);

  return {
    content: <MetadataConfigForm />,
    isOpen: !isOpen,
    title: "Metadata Configuration",
    isForm: true,
    formName: "metadata-config",
    classNames: {
      dialogContent: "max-h-[70vh]",
    },
    functions: [
      {
        isSubmit: true,
        name: "Save",
        variant: "default",
        action: () => {
          /* form submit handles persistence via submitFunction */
        },
      },
      {
        name: "Export Config",
        variant: "info",
        disabled: config.config.length === 0,
        action: () => {
          const element = document.createElement("a");
          const file = new Blob([JSON.stringify(config)], {
            type: "application/json",
          });
          element.href = URL.createObjectURL(file);
          element.download = "metadataConfig.json";
          element.click();
          element.remove();
        },
      },
      {
        name: "Import Config",
        variant: "info",
        disabled: config.config.length > 0,
        closeAfterwards: false,
        action: () => {
          const element = document.createElement("input");
          element.type = "file";
          element.accept = ".json";
          element.onchange = () => {
            const file = element.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const data = JSON.parse(
                  reader.result as string,
                ) as MetadataConfigTemplate;
                if (!data.config) {
                  alert("Invalid JSON file");
                  return;
                }
                setConfig(data);
              } catch {
                alert("Invalid JSON file");
              }
            };
            reader.readAsText(file);
          };
          element.click();
          element.remove();
        },
      },
    ],
    submitFunction: (data) => submitConfig(data as MetadataConfigTemplate),
  };
};

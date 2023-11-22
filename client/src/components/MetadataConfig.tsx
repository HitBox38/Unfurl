import { Button } from "@mui/material";
import { useDialogStore } from "../stores/DialogStore";
import { MetadataConfigForm } from "./MetadataConfigForm";
import useLocalStorage from "../hooks/useLocalStorage";
import { MetadataConfigTemplate } from "../interfaces/MetadataConfigTemplate";
import { SubmitHandler } from "react-hook-form";

export const MetadataConfig = () => {
  const [config, setConfig] = useLocalStorage<MetadataConfigTemplate>("metadataConfig", {
    config: [],
  });
  const { setContent } = useDialogStore((state) => state);

  const submitConfig: SubmitHandler<MetadataConfigTemplate> = (data) => {
    console.log(data);

    setConfig(data);
  };

  return (
    <Button
      variant="contained"
      onClick={() =>
        setContent({
          content: <MetadataConfigForm />,
          isOpen: true,
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
              // width: "3500px",
            },
          },
        })
      }>
      Config Metadata
    </Button>
  );
};

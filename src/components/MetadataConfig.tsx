import { Button } from "@mui/material";
import { useDialogStore } from "../stores/DialogStore";
import { useMetadataConfigFormModal } from "../modals/MetadataConfigFormModal";

export const MetadataConfig = () => {
  const { setContent } = useDialogStore((state) => state);

  const content = useMetadataConfigFormModal();
  return (
    <Button variant="contained" onClick={() => setContent(content)}>
      Config Metadata
    </Button>
  );
};

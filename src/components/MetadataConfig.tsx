import { Box, Button, Tooltip } from "@mui/material";
import { useDialogStore } from "../stores/DialogStore";
import { useMetadataConfigFormModal } from "../modals/MetadataConfigFormModal";
import { Help } from "@mui/icons-material";

export const MetadataConfig = () => {
  const { setContent } = useDialogStore((state) => state);

  const content = useMetadataConfigFormModal();
  return (
    <Box display="flex" flexDirection="row" gap="10px" alignItems="center">
      <Button variant="contained" onClick={() => setContent(content)}>
        Config Metadata
      </Button>
      <Tooltip
        arrow
        placement="top"
        title="Define custom data fields (like player stats, story flags, or game variables) that can be parsed from your story files using special symbols and edited in the node editor.">
        <Help />
      </Tooltip>
    </Box>
  );
};

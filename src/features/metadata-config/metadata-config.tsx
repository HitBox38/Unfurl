import { CircleHelp } from "lucide-react";

import { useDialogStore } from "@/shared/stores";
import { Button } from "@/shared/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";

import { useMetadataConfigFormModal } from "@/features/metadata-config/metadata-config-form-modal";

export const MetadataConfig = () => {
  const setContent = useDialogStore((state) => state.setContent);
  const content = useMetadataConfigFormModal();

  return (
    <div className="flex flex-row items-center gap-2.5">
      <Button onClick={() => setContent(content)}>Config Metadata</Button>
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex" aria-label="Metadata config help">
              <CircleHelp className="size-5 text-muted-foreground" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">
            Define custom data fields (like player stats, story flags, or game
            variables) that can be parsed from your story files using special
            symbols and edited in the node editor.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

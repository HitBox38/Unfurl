import { SlidersHorizontal } from "lucide-react";

import { useMetadataConfigFormModal } from "@/features/metadata-config-form-modal";
import { useDialogStore } from "@/shared/stores";
import type { ProjectRecord } from "@/shared/types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

interface MetadataConfigProps {
  project: ProjectRecord;
}

/** Opens the Metadata Config editor for `project`; shows the field count. */
export const MetadataConfig = ({ project }: MetadataConfigProps) => {
  const setContent = useDialogStore((state) => state.setContent);
  const content = useMetadataConfigFormModal(project);
  const fieldCount = project.metadataConfig.config.length;

  return (
    <Button variant="secondary" size="sm" onClick={() => setContent(content)}>
      <SlidersHorizontal aria-hidden="true" />
      Metadata config
      <Badge
        variant="outline"
        className="h-4 min-w-4 px-1 font-mono text-[0.625rem]"
        aria-label={`${fieldCount} metadata fields`}
      >
        {fieldCount}
      </Badge>
    </Button>
  );
};

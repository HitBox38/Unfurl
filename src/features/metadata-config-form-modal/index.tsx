import type { SubmitHandler } from "react-hook-form";

import {
  MetadataConfigForm,
  METADATA_CONFIG_IMPORT_INPUT_ID,
} from "@/features/metadata-config-form";
import { downloadJsonFile } from "@/shared/lib/download-json-file";
import {
  getProject,
  updateProjectMetadataConfig,
} from "@/shared/lib/projects-storage";
import type { DialogContent as DialogContentValue } from "@/shared/stores";
import type { MetadataConfigTemplate, ProjectRecord } from "@/shared/types";

/** Dialog content for editing the Metadata Config of one project. */
export const useMetadataConfigFormModal = (
  project: ProjectRecord,
): DialogContentValue => {
  const hasFields = project.metadataConfig.config.length > 0;

  const submitConfig: SubmitHandler<MetadataConfigTemplate> = (data) =>
    updateProjectMetadataConfig(project.id, data);

  return {
    content: (
      <MetadataConfigForm
        projectId={project.id}
        initialConfig={project.metadataConfig}
      />
    ),
    isOpen: true,
    title: "Metadata configuration",
    description:
      "Define custom data fields (like player stats, story flags, or game variables) that can be parsed from your story files using special symbols and edited in the node editor.",
    isForm: true,
    formName: "metadata-config",
    classNames: {
      dialog: "sm:max-w-3xl",
      dialogContent: "max-h-[60vh]",
    },
    functions: [
      {
        name: "Import config",
        variant: "secondary",
        closeAfterwards: false,
        action: () =>
          document.getElementById(METADATA_CONFIG_IMPORT_INPUT_ID)?.click(),
      },
      {
        name: "Export config",
        variant: "secondary",
        disabled: !hasFields,
        action: () => {
          const current =
            getProject(project.id)?.metadataConfig ?? project.metadataConfig;
          downloadJsonFile(`${project.name}-metadata-config.json`, current);
        },
      },
      {
        isSubmit: true,
        name: "Save",
        variant: "default",
        className: "sm:ml-auto",
        action: () => {
          /* form submit handles persistence via submitFunction */
        },
      },
    ],
    submitFunction: (data) => submitConfig(data as MetadataConfigTemplate),
  };
};

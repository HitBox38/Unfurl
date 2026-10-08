import { Plus } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { DefinitionRow } from "@/features/project-metadata-refactor/components/definition-row";
import type { MetadataRefactorController } from "@/features/project-metadata-refactor/hooks/use-metadata-refactor";

export const DefinitionEditor = ({
  refactor,
}: {
  refactor: MetadataRefactorController;
}) => (
  <>
    {refactor.edits.map((edit, index) => (
      <DefinitionRow
        key={edit.id}
        edit={edit}
        index={index}
        patch={refactor.patch}
        patchField={refactor.patchField}
        restoreDefinition={refactor.restoreDefinition}
      />
    ))}
    {!refactor.edits.length ? (
      <p className="py-3 text-sm text-muted-foreground">
        Define the data fields your game uses. New fields get an explicit
        default across all story nodes.
      </p>
    ) : null}
    <Button variant="outline" size="sm" onClick={refactor.addDefinition}>
      <Plus className="size-4" />
      Add definition
    </Button>
  </>
);

import type { MetadataEdit } from "@/shared/lib/project-metadata-refactor";
import type { MetadataRefactorController } from "@/features/project-metadata-refactor/hooks/use-metadata-refactor";
import { DefinitionFields } from "@/features/project-metadata-refactor/components/definition-fields";
import { DefinitionValues } from "@/features/project-metadata-refactor/components/definition-values";
import { Button } from "@/shared/ui/button";

export const DefinitionRow = ({
  edit,
  index,
  patch,
  patchField,
  restoreDefinition,
}: Pick<
  MetadataRefactorController,
  "patch" | "patchField" | "restoreDefinition"
> & { edit: MetadataEdit; index: number }) => (
  <section
    key={edit.id}
    className={`space-y-3 rounded-xl border p-3 ${edit.field ? "" : "border-destructive/30 bg-destructive/5"}`}
  >
    {edit.field ? (
      <>
        <DefinitionFields
          edit={edit}
          index={index}
          patch={patch}
          patchField={patchField}
        />
        <DefinitionValues edit={edit} index={index} patch={patch} />
      </>
    ) : (
      <p className="text-sm">
        Remove definition “{edit.originalName ?? "New field"}” and its values
        from all stories.{" "}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => restoreDefinition(edit)}
        >
          {edit.originalName ? "Restore" : "Dismiss"}
        </Button>
      </p>
    )}
  </section>
);

import type { MetadataEdit } from "@/shared/lib/project-metadata-refactor";
import type { MetadataRefactorController } from "@/features/project-metadata-refactor/hooks/use-metadata-refactor";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export const DefinitionFields = ({
  edit,
  index,
  patch,
  patchField,
}: Pick<MetadataRefactorController, "patch" | "patchField"> & {
  edit: MetadataEdit;
  index: number;
}) => {
  if (!edit.field) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <label className="space-y-1 text-xs text-muted-foreground">
        Name
        <Input
          aria-label={`Metadata field ${index + 1} name`}
          value={edit.field.name}
          onChange={(event) => patchField(edit, { name: event.target.value })}
        />
      </label>
      <label className="space-y-1 text-xs text-muted-foreground">
        Type
        <Select
          value={edit.field.type}
          onValueChange={(value) => {
            const type = value as "number" | "boolean";
            patch(edit.id, {
              field: { ...edit.field!, type },
              defaultValue: type === "number" ? 0 : false,
            });
          }}
        >
          <SelectTrigger
            className="w-full"
            aria-label={`Metadata field ${index + 1} type`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="boolean">Boolean</SelectItem>
          </SelectContent>
        </Select>
      </label>
      <label className="space-y-1 text-xs text-muted-foreground">
        Import sign
        <Input
          aria-label={`Metadata field ${index + 1} sign`}
          value={edit.field.sign}
          onChange={(event) => patchField(edit, { sign: event.target.value })}
        />
      </label>
      <label className="space-y-1 text-xs text-muted-foreground">
        Author label
        <Input
          aria-label={`Metadata field ${index + 1} label`}
          value={edit.field.label ?? ""}
          onChange={(event) => patchField(edit, { label: event.target.value })}
        />
      </label>
    </div>
  );
};

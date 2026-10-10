import { Trash2 } from "lucide-react";

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
import { Button } from "@/shared/ui/button";

export const DefinitionValues = ({
  edit,
  index,
  patch,
}: Pick<MetadataRefactorController, "patch"> & {
  edit: MetadataEdit;
  index: number;
}) => {
  if (!edit.field) return null;
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="min-w-32 space-y-1 text-xs text-muted-foreground">
        Fill missing values with
        {edit.field.type === "number" ? (
          <Input
            type="number"
            aria-label={`Metadata field ${index + 1} default`}
            value={String(edit.defaultValue)}
            onChange={(event) =>
              patch(edit.id, {
                defaultValue:
                  event.target.value === "" ? NaN : Number(event.target.value),
              })
            }
          />
        ) : (
          <Select
            value={String(edit.defaultValue)}
            onValueChange={(value) =>
              patch(edit.id, { defaultValue: value === "true" })
            }
          >
            <SelectTrigger
              className="w-full"
              aria-label={`Metadata field ${index + 1} default`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">False</SelectItem>
              <SelectItem value="true">True</SelectItem>
            </SelectContent>
          </Select>
        )}
      </label>
      <label className="min-w-48 space-y-1 text-xs text-muted-foreground">
        Type conversion
        <Select
          value={edit.conversion}
          onValueChange={(conversion) =>
            patch(edit.id, {
              conversion: conversion as MetadataEdit["conversion"],
            })
          }
        >
          <SelectTrigger
            className="w-full"
            aria-label={`Metadata field ${index + 1} conversion`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Keep matching values</SelectItem>
            <SelectItem value="binary">Convert 0/1 ↔ false/true</SelectItem>
          </SelectContent>
        </Select>
      </label>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Remove metadata field ${edit.field.name || index + 1}`}
        onClick={() => patch(edit.id, { field: null })}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
};

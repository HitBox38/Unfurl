import { Controller, useFormContext } from "react-hook-form";

import { useStorage } from "@/shared/hooks";
import type { MetadataConfigTemplate } from "@/shared/types";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export const NodeMetadataEditor = () => {
  const [{ config }] = useStorage<MetadataConfigTemplate>({
    key: "metadataConfig",
    defaultValue: { config: [] },
  });

  const { register, control } = useFormContext();

  if (config.length === 0) {
    return null;
  }

  return (
    <AccordionItem
      value="metadata"
      className="rounded-xl border bg-muted/20 px-3"
    >
      <AccordionTrigger>Metadata</AccordionTrigger>
      <AccordionContent className="flex flex-col gap-3 text-left">
      {config.map((field, index) => {
        if (field.type === "number") {
          return (
            <div key={`${field.name}-${index}`} className="flex flex-col gap-1">
              <Label htmlFor={`metadata.${field.name}`}>{field.label}</Label>
              <Input
                id={`metadata.${field.name}`}
                type="number"
                className="w-[150px]"
                {...register(`metadata.${field.name}`, { valueAsNumber: true })}
              />
            </div>
          );
        }
        return (
          <div
            key={`${field.name}-${index}`}
            className="flex items-center gap-2"
          >
            <Controller
              control={control}
              name={`metadata.${field.name}`}
              render={({ field: ctrl }) => (
                <Checkbox
                  id={`metadata.${field.name}`}
                  checked={!!ctrl.value}
                  onCheckedChange={(checked) => ctrl.onChange(!!checked)}
                />
              )}
            />
            <Label htmlFor={`metadata.${field.name}`}>{field.label}</Label>
          </div>
        );
      })}
      </AccordionContent>
    </AccordionItem>
  );
};

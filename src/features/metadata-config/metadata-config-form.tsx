import { Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { useStorage } from "@/shared/hooks";
import { cn } from "@/shared/lib/cn";
import type { MetadataConfigTemplate } from "@/shared/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

interface FieldProps {
  className?: string;
  label: string;
  helperText?: string;
  children: React.ReactNode;
}

const FormField = ({ className, label, helperText, children }: FieldProps) => (
  <div className={cn("flex flex-col gap-1 text-left", className)}>
    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
      {label}
    </Label>
    {children}
    {helperText ? (
      <span className="text-[11px] text-muted-foreground">{helperText}</span>
    ) : null}
  </div>
);

export const MetadataConfigForm = () => {
  const [storedConfig] = useStorage<MetadataConfigTemplate>({
    key: "metadataConfig",
    defaultValue: { config: [] },
  });
  const { control, register, reset } = useFormContext<MetadataConfigTemplate>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "config",
  });

  useEffect(() => {
    if (storedConfig && storedConfig.config.length > 0) {
      reset(storedConfig);
    }
  }, [storedConfig, reset]);

  return (
    <div className="flex flex-col items-center justify-evenly gap-4 pt-2">
      {fields.map((line, index) => (
        <div
          key={line.id}
          className="flex min-w-[700px] flex-wrap items-end justify-between gap-2"
        >
          <FormField className="w-[230px]" label="Name">
            <Input
              {...register(`config.${index}.name`, { required: true })}
              defaultValue={line.name}
            />
          </FormField>
          <FormField
            className="w-[200px]"
            label="Sign"
            helperText="Use a set of symbols that won't repeat in the dialog"
          >
            <Input
              {...register(`config.${index}.sign`, { required: true })}
              defaultValue={line.sign}
            />
          </FormField>
          <FormField className="w-[120px]" label="Type">
            <Controller
              name={`config.${index}.type`}
              defaultValue={line.type}
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-label="Type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField className="w-[230px]" label="Label">
            <Input
              {...register(`config.${index}.label`)}
              defaultValue={line.label ?? ""}
            />
          </FormField>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
            aria-label="Remove metadata field"
            className="text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={() =>
          append({ name: "", sign: "", type: "number", label: "" })
        }
      >
        Add
      </Button>
    </div>
  );
};

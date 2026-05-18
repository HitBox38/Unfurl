import { Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { useStorage } from "@/shared/hooks";
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

const COLUMN_HEADER_CLASS =
  "text-xs uppercase tracking-wide text-muted-foreground";
const ROW_GRID_CLASS =
  "grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(120px,140px)_minmax(0,1.1fr)_36px] items-center gap-x-3 gap-y-1.5";

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

  const hasRows = fields.length > 0;

  return (
    <div className="flex flex-col gap-4 pt-2">
      {hasRows ? (
        <div className="flex flex-col divide-y divide-border/60">
          {fields.map((line, index) => (
            <div key={line.id} className={`${ROW_GRID_CLASS} py-3`}>
              <Label
                htmlFor={`config.${index}.name`}
                className={COLUMN_HEADER_CLASS}
              >
                Name
              </Label>
              <Label
                htmlFor={`config.${index}.sign`}
                className={COLUMN_HEADER_CLASS}
              >
                Sign
              </Label>
              <Label
                htmlFor={`config.${index}.type`}
                className={COLUMN_HEADER_CLASS}
              >
                Type
              </Label>
              <Label
                htmlFor={`config.${index}.label`}
                className={COLUMN_HEADER_CLASS}
              >
                Label
              </Label>
              <span aria-hidden />

              <Input
                id={`config.${index}.name`}
                defaultValue={line.name}
                {...register(`config.${index}.name`, { required: true })}
              />
              <Input
                id={`config.${index}.sign`}
                defaultValue={line.sign}
                {...register(`config.${index}.sign`, { required: true })}
              />
              <Controller
                name={`config.${index}.type`}
                defaultValue={line.type}
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id={`config.${index}.type`}
                      aria-label="Type"
                    >
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <Input
                id={`config.${index}.label`}
                defaultValue={line.label ?? ""}
                {...register(`config.${index}.label`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                aria-label={`Remove ${line.name || "field"}`}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>

              <span aria-hidden />
              <p className="text-[11px] leading-snug text-muted-foreground">
                Use a set of symbols that won&apos;t repeat in the dialog.
              </p>
              <span aria-hidden />
              <span aria-hidden />
              <span aria-hidden />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No metadata fields configured yet. Click <strong>Add</strong> to
          create your first one.
        </p>
      )}
      <div className="flex justify-center">
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
    </div>
  );
};

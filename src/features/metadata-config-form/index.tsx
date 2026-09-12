import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { isMetadataConfigTemplate } from "@/shared/lib/is-metadata-config-template";
import { updateProjectMetadataConfig } from "@/shared/lib/projects-storage";
import type { MetadataConfigTemplate } from "@/shared/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import {
  COLUMN_HEADER_CLASS,
  INVALID_CONFIG_FILE_REASON,
  METADATA_CONFIG_IMPORT_INPUT_ID,
  ROW_GRID_CLASS,
} from "./constants";

export { METADATA_CONFIG_IMPORT_INPUT_ID };

interface MetadataConfigFormProps {
  projectId: string;
  initialConfig: MetadataConfigTemplate;
}

const readImportedConfig = (
  file: File,
): Promise<MetadataConfigTemplate | null> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data: unknown = JSON.parse(reader.result as string);
        resolve(isMetadataConfigTemplate(data) ? data : null);
      } catch {
        resolve(null);
      }
    };
    reader.readAsText(file);
  });

export const MetadataConfigForm = ({
  projectId,
  initialConfig,
}: MetadataConfigFormProps) => {
  const {
    control,
    register,
    reset,
    formState: { errors },
  } = useFormContext<MetadataConfigTemplate>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "config",
  });
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] =
    useState<MetadataConfigTemplate | null>(null);

  useEffect(() => {
    reset(initialConfig);
  }, [initialConfig, reset]);

  const applyImport = (imported: MetadataConfigTemplate) => {
    updateProjectMetadataConfig(projectId, imported);
    reset(imported);
    setPendingImport(null);
    setImportError(null);
  };

  const onPickImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const imported = await readImportedConfig(file);
    if (!imported) {
      setPendingImport(null);
      setImportError(INVALID_CONFIG_FILE_REASON);
      return;
    }

    setImportError(null);
    if (fields.length > 0) {
      setPendingImport(imported);
      return;
    }
    applyImport(imported);
  };

  const hasRows = fields.length > 0;

  return (
    <div className="flex flex-col gap-4 pt-2">
      <details className="rounded-lg border bg-muted/30 p-3 text-sm">
        <summary className="cursor-pointer font-medium">
          How metadata fields work
        </summary>
        <div className="mt-2 space-y-2 text-muted-foreground">
          <p>
            <strong>Name</strong> is the JSON key, such as{" "}
            <code>reputation</code>. <strong>Sign</strong> is the unique prefix
            on a metadata line, such as <code>@@rep</code>. Both are required.
          </p>
          <p>
            <strong>Type</strong> chooses a number or a Boolean flag.{" "}
            <strong>Label</strong> is an optional friendly name in the editor;
            it defaults to Name.
          </p>
          <p>
            Example: Name <code>reputation</code>, Sign <code>@@rep</code>, Type
            Number, Label Reputation. A line containing <code>@@rep 5</code> in
            an imported story sets reputation to 5. For a Boolean field, a line
            with its sign sets it to true.
          </p>
        </div>
      </details>
      {hasRows ? (
        <div className="flex flex-col gap-1">
          <div className={`${ROW_GRID_CLASS} hidden sm:grid`}>
            <span className={COLUMN_HEADER_CLASS}>Name *</span>
            <span className={COLUMN_HEADER_CLASS}>Sign *</span>
            <span className={COLUMN_HEADER_CLASS}>Type</span>
            <span className={COLUMN_HEADER_CLASS}>Label</span>
            <span aria-hidden />
          </div>
          <p className="text-xs text-muted-foreground">
            Use a set of symbols for the sign that won&apos;t repeat in the
            dialog.
          </p>
          <div className="flex flex-col divide-y divide-border/60">
            {fields.map((line, index) => (
              <div key={line.id} className={`${ROW_GRID_CLASS} py-3`}>
                <div className="min-w-0 space-y-1">
                  <label
                    className="text-sm sm:sr-only"
                    htmlFor={`config.${index}.name`}
                  >
                    Name *
                  </label>
                  <Input
                    id={`config.${index}.name`}
                    aria-label="Name"
                    placeholder="e.g. reputation"
                    aria-required="true"
                    aria-invalid={Boolean(errors.config?.[index]?.name)}
                    aria-describedby={`config-${index}-errors`}
                    {...register(`config.${index}.name`, {
                      validate: (value) =>
                        Boolean(value.trim()) || "Name is required",
                    })}
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <label
                    className="text-sm sm:sr-only"
                    htmlFor={`config.${index}.sign`}
                  >
                    Sign *
                  </label>
                  <Input
                    id={`config.${index}.sign`}
                    aria-label="Sign"
                    placeholder="e.g. @@rep"
                    aria-required="true"
                    aria-invalid={Boolean(errors.config?.[index]?.sign)}
                    aria-describedby={`config-${index}-errors`}
                    {...register(`config.${index}.sign`, {
                      validate: (value) =>
                        Boolean(value.trim()) || "Sign is required",
                    })}
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <label
                    className="text-sm sm:sr-only"
                    htmlFor={`config.${index}.type`}
                  >
                    Type
                  </label>
                  <Controller
                    name={`config.${index}.type`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
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
                </div>
                <div className="min-w-0 space-y-1">
                  <label
                    className="text-sm sm:sr-only"
                    htmlFor={`config.${index}.label`}
                  >
                    Label
                  </label>
                  <Input
                    id={`config.${index}.label`}
                    aria-label="Label"
                    placeholder="Optional display name"
                    {...register(`config.${index}.label`)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(index)}
                  aria-label={`Remove ${line.name || "field"}`}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 aria-hidden="true" />
                </Button>
                <div
                  id={`config-${index}-errors`}
                  className="col-span-full text-sm text-destructive"
                  role="alert"
                >
                  {errors.config?.[index]?.name?.message}
                  {errors.config?.[index]?.sign ? (
                    <p>{errors.config[index].sign.message}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-1 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">No metadata fields yet.</p>
          <p>Add a field or import a config file to get started.</p>
        </div>
      )}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="self-start"
        onClick={() =>
          append({ name: "", sign: "", type: "number", label: "" })
        }
      >
        <Plus aria-hidden="true" />
        Add field
      </Button>

      {pendingImport ? (
        <div
          role="status"
          className="flex flex-col gap-2 rounded-lg border p-3 text-sm"
        >
          <p>
            Replace {fields.length} {fields.length === 1 ? "field" : "fields"}{" "}
            with this file?
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setPendingImport(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => applyImport(pendingImport)}
            >
              Replace
            </Button>
          </div>
        </div>
      ) : null}

      {importError ? (
        <p role="alert" className="text-sm text-destructive">
          {importError}
        </p>
      ) : null}

      <input
        id={METADATA_CONFIG_IMPORT_INPUT_ID}
        type="file"
        accept=".json"
        aria-label="Import config file"
        className="sr-only"
        onChange={(event) => void onPickImport(event)}
      />
    </div>
  );
};

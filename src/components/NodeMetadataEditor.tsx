import { Box, Checkbox, TextField, Typography } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { useStorage } from "../hooks/useStorage";
import { MetadataConfigTemplate } from "../interfaces/MetadataConfigTemplate";
import { tss } from "tss-react/mui";

export const NodeMetadataEditor = () => {
  const [{ config }] = useStorage<MetadataConfigTemplate>({
    key: "metadataConfig",
    defaultValue: {
      config: [],
    },
  });

  const { register, control } = useFormContext();

  const { classes } = useStyles();

  return (
    <Box className={classes.nodeMetadataEditor}>
      {config.length ? <Typography variant="h4">Metadata</Typography> : null}
      {config.map((conLine, index) => {
        if (conLine.type === "number") {
          return (
            <TextField
              className={classes.field}
              label={conLine.label}
              {...register(`metadata.${conLine.name}`)}
              type="number"
              key={index}
            />
          );
        } else if (conLine.type === "boolean") {
          return (
            <div key={index}>
              <Controller
                control={control}
                name={`metadata.${conLine.name}`}
                render={({ field }) => (
                  <Checkbox
                    {...field}
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
              <label htmlFor={`metadata.${conLine.name}`}>{conLine.label}</label>
            </div>
          );
        }
      })}
    </Box>
  );
};

const useStyles = tss.create(() => ({
  nodeMetadataEditor: {
    width: "350px",
  },
  field: {
    width: "150px",
  },
}));

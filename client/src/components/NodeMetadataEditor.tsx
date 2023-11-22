import { Box, Checkbox, TextField, Typography } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import useLocalStorage from "../hooks/useLocalStorage";
import { MetadataConfigTemplate } from "../interfaces/MetadataConfigTemplate";

export const NodeMetadataEditor = () => {
  const [{ config }] = useLocalStorage<MetadataConfigTemplate>("metadataConfig", {
    config: [],
  });

  const { register, control } = useFormContext();
  return (
    <Box width={"350px"}>
      <Typography variant="h4">Metadata</Typography>
      {/* <Box display="flex" flexDirection="row" justifyContent="space-around"> */}
      {config.map((conLine, index) => {
        if (conLine.type === "number") {
          return (
            <TextField
              sx={{ width: "150px" }}
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
      {/* <TextField
          sx={{ width: "150px" }}
          label="Affection to add"
          {...register("metadata.affectionToAdd")}
          type="number"
        />
        <TextField
          sx={{ width: "150px" }}
          label="Affection required"
          {...register("metadata.affectionRequired")}
          type="number"
        />
      </Box>
      <div>
        <Controller
          control={control}
          name={"metadata.giveBlessing"}
          render={({ field }) => (
            <Checkbox
              {...field}
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />
        <label htmlFor="metadata.giveBlessing">Does it give blessing?</label>
      </div>
      <div>
        <Controller
          control={control}
          name={"metadata.giveHead"}
          render={({ field }) => (
            <Checkbox
              {...field}
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />
        <label htmlFor="metadata.giveHead">Does it give head?</label>
      </div> */}
    </Box>
  );
};

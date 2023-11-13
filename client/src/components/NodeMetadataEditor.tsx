import { Box, Checkbox, TextField, Typography } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

export const NodeMetadataEditor = () => {
  const { register, control } = useFormContext();
  return (
    <Box width={"350px"}>
      <Typography variant="h4">Metadata</Typography>
      <Box display="flex" flexDirection="row" justifyContent="space-around">
        <TextField
          sx={{ width: "150px" }}
          label="Affection to add"
          {...register("metadata.affectionToAdd")}
        />
        <TextField
          sx={{ width: "150px" }}
          label="Affection required"
          {...register("metadata.affectionRequired")}
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
      </div>
    </Box>
  );
};
